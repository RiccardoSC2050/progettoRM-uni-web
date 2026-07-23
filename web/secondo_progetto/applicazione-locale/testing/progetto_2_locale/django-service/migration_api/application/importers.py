from decimal import Decimal
from typing import Callable

from migration_api.application.mappers import pick
from migration_api.domain.resources import Resource
from migration_api.models import (
    ContrattoTelefonico,
    SimAttiva,
    SimDisattiva,
    Telefonata,
)


Handler = Callable[[list[dict], str], int]

_HANDLERS: dict[Resource, Handler] = {
    Resource.CONTRATTI: lambda records, database: _contracts(records, database),
    Resource.SIM_ATTIVE: lambda records, database: _active_sims(records, database),
    Resource.SIM_DISATTIVE: lambda records, database: _inactive_sims(records, database),
    Resource.TELEFONATE: lambda records, database: _calls(records, database),
}


def import_records(resource: Resource, records: list[dict], database: str) -> int:
    return _HANDLERS[resource](records, database)


def _contracts(records: list[dict], database: str) -> int:
    manager = ContrattoTelefonico.objects.using(database)
    for record in records:
        manager.update_or_create(
            numero=required(record, "numero"),
            defaults={
                "data_attivazione": pick(record, "dataAttivazione", "data_attivazione"),
                "tipo": pick(record, "tipo"),
                "minuti_residui": pick(record, "minutiResidui", "minuti_residui"),
                "credito_residuo": pick(record, "creditoResiduo", "credito_residuo"),
            },
        )
    return len(records)


def _active_sims(records: list[dict], database: str) -> int:
    available = _existing_contracts(records, database, "associataA", "associata_a")
    manager = SimAttiva.objects.using(database)
    imported = 0

    for record in records:
        contract_number = required(record, "associataA", "associata_a")
        if contract_number not in available:
            continue
        manager.update_or_create(
            contratto_id=contract_number,
            defaults={
                "codice": required(record, "codice"),
                "tipo_sim": pick(record, "tipoSIM", "tipo_sim"),
                "data_attivazione": pick(record, "dataAttivazione", "data_attivazione"),
            },
        )
        imported += 1
    return imported


def _inactive_sims(records: list[dict], database: str) -> int:
    available = _existing_contracts(records, database, "eraAssociataA", "era_associata_a")
    manager = SimDisattiva.objects.using(database)
    imported = 0

    for record in records:
        contract_number = required(record, "eraAssociataA", "era_associata_a")
        if contract_number not in available:
            continue
        manager.update_or_create(
            codice=required(record, "codice"),
            defaults={
                "tipo_sim": pick(record, "tipoSIM", "tipo_sim"),
                "contratto_id": contract_number,
                "data_attivazione": pick(record, "dataAttivazione", "data_attivazione"),
                "data_disattivazione": pick(record, "dataDisattivazione", "data_disattivazione"),
            },
        )
        imported += 1
    return imported


def _calls(records: list[dict], database: str) -> int:
    available = _existing_contracts(records, database, "effettuataDa", "effettuata_da")
    manager = Telefonata.objects.using(database)
    imported = 0

    for record in records:
        contract_number = required(record, "effettuataDa", "effettuata_da")
        if contract_number not in available:
            continue
        cost = pick(record, "costo")
        manager.update_or_create(
            contratto_id=contract_number,
            id=required(record, "id"),
            defaults={
                "data": pick(record, "data"),
                "ora": pick(record, "ora"),
                "durata": pick(record, "durata"),
                "costo": Decimal(str(cost)) if cost is not None else None,
            },
        )
        imported += 1
    return imported


def _existing_contracts(records: list[dict], database: str, *field_names: str) -> set[str]:
    contract_numbers = {required(record, *field_names) for record in records}
    return set(
        ContrattoTelefonico.objects.using(database)
        .filter(numero__in=contract_numbers)
        .values_list("numero", flat=True)
    )


def required(record: dict, *names: str):
    value = pick(record, *names)
    if value is None or value == "":
        raise ValueError(f"Campo obbligatorio mancante: {'/'.join(names)}")
    return value
