"""Metadati unici dello schema funzionale PostgreSQL."""

from dataclasses import dataclass


@dataclass(frozen=True)
class TableSpec:
    name: str
    label: str
    columns: tuple[str, ...]
    order_by: tuple[str, ...]
    contract_column: str | None = None


CONTRACT_TABLE = "contratto_telefonico"
ACTIVE_SIM_TABLE = "sim_attiva"
INACTIVE_SIM_TABLE = "sim_disattiva"
CALL_TABLE = "telefonata"

TABLE_SPECS = (
    TableSpec(
        CONTRACT_TABLE,
        "Contratti telefonici",
        ("numero", "data_attivazione", "tipo", "minuti_residui", "credito_residuo"),
        ("numero",),
    ),
    TableSpec(
        ACTIVE_SIM_TABLE,
        "SIM attive",
        ("codice", "tipo_sim", "associata_a", "data_attivazione"),
        ("associata_a", "codice"),
        "associata_a",
    ),
    TableSpec(
        INACTIVE_SIM_TABLE,
        "SIM disattive",
        ("codice", "tipo_sim", "numero_contratto", "data_attivazione", "data_disattivazione"),
        ("numero_contratto", "codice"),
        "numero_contratto",
    ),
    TableSpec(
        CALL_TABLE,
        "Telefonate",
        ("id", "effettuata_da", "data", "ora", "durata", "costo"),
        ("effettuata_da", "id"),
        "effettuata_da",
    ),
)

TABLE_BY_NAME = {table.name: table for table in TABLE_SPECS}
PROJECT_TABLE_NAMES = frozenset(TABLE_BY_NAME)
DEFAULT_TABLE = CONTRACT_TABLE


def table_spec(name: str) -> TableSpec:
    try:
        return TABLE_BY_NAME[name]
    except KeyError as exception:
        raise ValueError("Tabella del progetto non valida.") from exception
