"""Casi d'uso applicativi per la preparazione e l'importazione dei database."""

from django.db import transaction

from migration_api.application.importers import import_records
from migration_api.domain.resources import Resource
from migration_api.infrastructure.database import (
    configure_database,
    drop_database,
    list_databases,
    recreate_database,
    validate_name,
)


def available_databases() -> list[str]:
    """Restituisce i database locali creati dall'applicazione."""
    return list_databases()


def delete_destination_database(raw_name: str) -> str:
    """Valida ed elimina il database locale selezionato."""
    database = validate_name(raw_name)
    drop_database(database)
    return database


def prepare_destination_database(raw_name: str) -> str:
    """Valida e ricrea il database di destinazione."""
    database = validate_name(raw_name)
    recreate_database(database)
    return database


def import_destination_resource(
    resource_name: str,
    raw_database_name: str,
    payload: dict,
) -> tuple[str, Resource, int]:
    """Importa una risorsa nel database selezionato in una transazione atomica."""
    resource = Resource.parse(resource_name)
    database = validate_name(raw_database_name)
    alias = configure_database(database)
    records = _extract_records(payload)

    with transaction.atomic(using=alias):
        imported = import_records(resource, records, alias)

    return database, resource, imported


def _extract_records(payload: dict) -> list[dict]:
    data = payload.get("data", payload)
    records = data.get("items", data.get("records"))
    if not isinstance(records, list):
        raise ValueError("Il payload deve contenere data.items come lista.")
    return records
