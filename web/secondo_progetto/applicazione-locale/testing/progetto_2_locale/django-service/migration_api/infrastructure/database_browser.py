"""Accesso in sola lettura ai dati funzionali mostrati nel visualizzatore."""

from dataclasses import dataclass
from typing import Any

from django.db import connections

from migration_api.infrastructure.database import configure_database

PROJECT_TABLES = (
    "contratto_telefonico",
    "sim_attiva",
    "sim_disattiva",
    "sim_non_attiva",
    "telefonata",
)
MAX_VISIBLE_ROWS = 50


@dataclass(frozen=True)
class TableSnapshot:
    name: str
    count: int
    columns: list[str]
    rows: list[tuple[Any, ...]]


def load_database_snapshot(database: str) -> list[TableSnapshot]:
    """Carica solo le tabelle di dominio, escludendo le tabelle tecniche Django."""
    alias = configure_database(database)
    connection = connections[alias]

    with connection.cursor() as cursor:
        discovered = set(connection.introspection.table_names(cursor))
        snapshots: list[TableSnapshot] = []

        for table in PROJECT_TABLES:
            if table not in discovered:
                continue

            quoted = connection.ops.quote_name(table)
            cursor.execute(f"SELECT COUNT(*) FROM {quoted}")
            count = cursor.fetchone()[0]
            cursor.execute(f"SELECT * FROM {quoted} LIMIT {MAX_VISIBLE_ROWS}")
            columns = [column[0] for column in cursor.description]
            rows = list(cursor.fetchall())
            snapshots.append(TableSnapshot(table, count, columns, rows))

    return snapshots
