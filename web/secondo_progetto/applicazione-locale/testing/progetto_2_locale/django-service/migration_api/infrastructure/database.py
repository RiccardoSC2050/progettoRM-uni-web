import re
from copy import deepcopy

from django.conf import settings
from django.db import connections
from psycopg import connect
from psycopg import sql

from migration_api.domain.schema import PROJECT_TABLE_NAMES

VALID_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,62}$")
SYSTEM_DATABASES = {"postgres", "template0", "template1"}


def validate_name(value: str) -> str:
    name = (value or "").strip()
    if not VALID_NAME.fullmatch(name):
        raise ValueError(
            "Il nome deve iniziare con una lettera e contenere solo lettere, numeri o underscore."
        )
    if name in SYSTEM_DATABASES:
        raise ValueError("Nome database riservato.")
    return name


def list_databases() -> list[str]:
    """Restituisce soltanto i database riconoscibili come destinazioni del progetto."""
    with _admin_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT datname FROM pg_database "
                "WHERE datistemplate = false AND datname <> 'postgres' "
                "ORDER BY datname"
            )
            candidates = [row[0] for row in cursor.fetchall()]

    return [name for name in candidates if _is_project_database(name)]


def drop_database(name: str) -> None:
    """Elimina in modo sicuro un database locale creato dall'applicazione."""
    selected = validate_name(name)
    if not _is_project_database(selected):
        raise ValueError("Il database selezionato non appartiene a questo progetto.")
    _close_dynamic_connections()
    with _admin_connection(autocommit=True) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
                "WHERE datname = %s AND pid <> pg_backend_pid()",
                [selected],
            )
            cursor.execute(
                sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(selected))
            )


def recreate_database(name: str) -> None:
    selected = validate_name(name)
    _close_dynamic_connections()
    with _admin_connection(autocommit=True) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
                "WHERE datname = %s AND pid <> pg_backend_pid()",
                [selected],
            )
            cursor.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(selected)))
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(selected)))
    alias = configure_database(selected)
    _create_destination_schema(alias)


def _create_destination_schema(alias: str) -> None:
    """Crea nel database di destinazione soltanto le tabelle del progetto.

    Il database importato non deve contenere le tabelle amministrative di
    Django (auth_*, django_content_type, django_migrations, ecc.). Il servizio
    usa quindi lo schema editor direttamente, invece di eseguire tutte le
    migrazioni installate nel progetto Django.
    """
    from migration_api.models import DESTINATION_MODELS

    connection = connections[alias]
    with connection.schema_editor() as schema_editor:
        for model in DESTINATION_MODELS:
            schema_editor.create_model(model)


def configure_database(name: str) -> str:
    selected = validate_name(name)
    alias = alias_for(selected)
    configuration = deepcopy(settings.DATABASES["default"])
    configuration["NAME"] = selected
    connections.databases[alias] = configuration
    return alias


def alias_for(name: str) -> str:
    return "target_" + re.sub(r"[^A-Za-z0-9_]", "_", name)


def _is_project_database(name: str) -> bool:
    try:
        with _database_connection(name) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
                )
                tables = {row[0] for row in cursor.fetchall()}
                return PROJECT_TABLE_NAMES.issubset(tables)
    except Exception:
        return False


def _database_connection(name: str):
    configuration = settings.DATABASES["default"]
    return connect(
        dbname=name,
        user=configuration["USER"],
        password=configuration["PASSWORD"],
        host=configuration["HOST"],
        port=configuration["PORT"],
    )


def _admin_connection(autocommit=False):
    configuration = settings.DATABASES["default"]
    return connect(
        dbname=configuration["NAME"],
        user=configuration["USER"],
        password=configuration["PASSWORD"],
        host=configuration["HOST"],
        port=configuration["PORT"],
        autocommit=autocommit,
    )


def _close_dynamic_connections() -> None:
    for alias in list(connections.databases):
        if alias.startswith("target_"):
            connections[alias].close()
            connections.databases.pop(alias, None)
