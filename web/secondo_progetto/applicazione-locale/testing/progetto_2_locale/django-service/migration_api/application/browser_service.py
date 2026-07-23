"""Caso d'uso per comporre la vista relazionale e le tabelle paginate."""

from migration_api.application.database_service import available_databases
from migration_api.domain.schema import DEFAULT_TABLE, TABLE_SPECS, table_spec
from migration_api.infrastructure.database import validate_name
from migration_api.infrastructure.database_browser import (
    load_contract_detail,
    load_contracts,
    load_table_counts,
    load_table_page,
)


def build_browser_context(query) -> dict:
    databases = available_databases()
    selected = _selected_database(query.get("database"), databases)
    selected_table = _selected_table(query.get("table"))
    contract_number = (query.get("contract") or "").strip()

    context = {
        "available_databases": databases,
        "selected_database": selected,
        "table_specs": TABLE_SPECS,
        "selected_table": selected_table,
        "selected_contract": contract_number,
        "table_counts": [],
        "contracts": None,
        "contract_detail": None,
        "table_page": None,
    }
    if not selected:
        return context

    context["table_counts"] = load_table_counts(selected)
    context["contracts"] = load_contracts(selected, _positive_int(query.get("contracts_page")))
    context["table_page"] = load_table_page(
        selected,
        selected_table.name,
        _positive_int(query.get("table_page")),
        contract_number,
    )
    if contract_number:
        context["contract_detail"] = load_contract_detail(
            selected,
            contract_number,
            _positive_int(query.get("inactive_page")),
            _positive_int(query.get("calls_page")),
        )
    return context


def _selected_database(requested: str | None, available: list[str]) -> str:
    raw = (requested or "").strip()
    selected = validate_name(raw) if raw else (available[0] if available else "")
    return selected if selected in available else ""


def _selected_table(requested: str | None):
    try:
        return table_spec((requested or DEFAULT_TABLE).strip())
    except ValueError:
        return table_spec(DEFAULT_TABLE)


def _positive_int(value: str | None) -> int:
    try:
        return max(1, int(value or "1"))
    except (TypeError, ValueError):
        return 1
