"""Repository di sola lettura per il visualizzatore PostgreSQL."""

from dataclasses import dataclass
from math import ceil
from typing import Any

from django.core.paginator import Page, Paginator
from django.db import connections
from django.db.models import Count

from migration_api.domain.schema import TABLE_SPECS, TableSpec, table_spec
from migration_api.infrastructure.database import configure_database
from migration_api.models import ContrattoTelefonico

TABLE_PAGE_SIZE = 50
CONTRACT_PAGE_SIZE = 20
RELATED_PAGE_SIZE = 50


@dataclass(frozen=True)
class TableCount:
    spec: TableSpec
    count: int


@dataclass(frozen=True)
class PageInfo:
    number: int
    total_pages: int
    total_items: int
    start: int
    end: int

    @property
    def has_previous(self) -> bool:
        return self.number > 1

    @property
    def has_next(self) -> bool:
        return self.number < self.total_pages


@dataclass(frozen=True)
class TablePage:
    spec: TableSpec
    columns: list[str]
    rows: list[tuple[Any, ...]]
    page: PageInfo
    contract_filter: str | None


@dataclass(frozen=True)
class ContractDetail:
    contract: ContrattoTelefonico
    inactive_sims: Page
    calls: Page


def load_table_counts(database: str) -> list[TableCount]:
    alias = configure_database(database)
    connection = connections[alias]
    counts: list[TableCount] = []

    with connection.cursor() as cursor:
        for spec in TABLE_SPECS:
            quoted = connection.ops.quote_name(spec.name)
            cursor.execute(f"SELECT COUNT(*) FROM {quoted}")
            counts.append(TableCount(spec, int(cursor.fetchone()[0])))
    return counts


def load_contracts(database: str, page_number: int) -> Page:
    alias = configure_database(database)
    queryset = (
        ContrattoTelefonico.objects.using(alias)
        .select_related("sim_attiva")
        .annotate(
            inactive_sim_count=Count("sim_disattive", distinct=True),
            call_count=Count("telefonate", distinct=True),
        )
        .order_by("numero")
    )
    return Paginator(queryset, CONTRACT_PAGE_SIZE).get_page(page_number)


def load_contract_detail(
    database: str,
    contract_number: str,
    inactive_page: int,
    calls_page: int,
) -> ContractDetail | None:
    alias = configure_database(database)
    contract = (
        ContrattoTelefonico.objects.using(alias)
        .select_related("sim_attiva")
        .filter(numero=contract_number)
        .first()
    )
    if contract is None:
        return None

    inactive_sims = Paginator(
        contract.sim_disattive.using(alias).all().order_by("data_disattivazione", "codice"),
        RELATED_PAGE_SIZE,
    ).get_page(inactive_page)
    calls = Paginator(
        contract.telefonate.using(alias).all().order_by("data", "ora", "id"),
        RELATED_PAGE_SIZE,
    ).get_page(calls_page)
    return ContractDetail(contract, inactive_sims, calls)


def load_table_page(
    database: str,
    table_name: str,
    page_number: int,
    contract_filter: str | None = None,
) -> TablePage:
    spec = table_spec(table_name)
    alias = configure_database(database)
    connection = connections[alias]
    quoted_table = connection.ops.quote_name(spec.name)

    where_sql = ""
    parameters: list[Any] = []
    selected_contract = (contract_filter or "").strip() or None
    if selected_contract and spec.contract_column:
        where_sql = f" WHERE {connection.ops.quote_name(spec.contract_column)} = %s"
        parameters.append(selected_contract)

    with connection.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) FROM {quoted_table}{where_sql}", parameters)
        total = int(cursor.fetchone()[0])
        page = _page_info(page_number, total, TABLE_PAGE_SIZE)

        selected_columns = ", ".join(
            connection.ops.quote_name(column) for column in spec.columns
        )
        order_sql = ", ".join(connection.ops.quote_name(column) for column in spec.order_by)
        cursor.execute(
            f"SELECT {selected_columns} FROM {quoted_table}{where_sql} "
            f"ORDER BY {order_sql} LIMIT %s OFFSET %s",
            [*parameters, TABLE_PAGE_SIZE, (page.number - 1) * TABLE_PAGE_SIZE],
        )
        columns = [column[0] for column in cursor.description]
        rows = list(cursor.fetchall())

    return TablePage(spec, columns, rows, page, selected_contract if spec.contract_column else None)


def _page_info(requested_page: int, total: int, page_size: int) -> PageInfo:
    total_pages = max(1, ceil(total / page_size))
    number = min(max(1, requested_page), total_pages)
    start = 0 if total == 0 else ((number - 1) * page_size) + 1
    end = min(number * page_size, total)
    return PageInfo(number, total_pages, total, start, end)
