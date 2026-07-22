from decimal import Decimal
from typing import Callable

from migration_api.application.mappers import pick
from migration_api.domain.resources import Resource
from migration_api.models import (
    ContrattoTelefonico,
    SimAttiva,
    SimDisattiva,
    SimNonAttiva,
    Telefonata,
)


def import_records(resource: Resource, records: list[dict], database: str) -> int:
    return _handlers()[resource](records, database)


def _handlers() -> dict[Resource, Callable[[list[dict], str], int]]:
    return {
        Resource.CONTRATTI: _contracts,
        Resource.SIM_ATTIVE: _active_sims,
        Resource.SIM_DISATTIVE: _inactive_sims,
        Resource.SIM_NON_ATTIVE: _unactivated_sims,
        Resource.TELEFONATE: _calls,
    }


def _contracts(records: list[dict], database: str) -> int:
    manager = ContrattoTelefonico.objects.using(database)
    for record in records:
        number = required(record, "numero")
        manager.update_or_create(
            numero=number,
            defaults={
                "data_attivazione": pick(record, "dataAttivazione", "data_attivazione"),
                "tipo": pick(record, "tipo"),
                "minuti_residui": pick(record, "minutiResidui", "minuti_residui"),
                "credito_residuo": pick(record, "creditoResiduo", "credito_residuo"),
            },
        )
    return len(records)


def _active_sims(records: list[dict], database: str) -> int:
    manager = SimAttiva.objects.using(database)
    available_contracts = _available_contracts(
        records,
        database,
        "associataA",
        "associata_a",
    )
    imported = 0
    for record in records:
        contract_number = required(record, "associataA", "associata_a")
        if contract_number not in available_contracts:
            # Nel campione ridotto il contratto padre potrebbe non essere stato selezionato.
            # La riga viene ignorata invece di creare una relazione non valida.
            continue
        manager.update_or_create(
            codice=required(record, "codice"),
            defaults={
                "tipo_sim": pick(record, "tipoSIM", "tipo_sim"),
                "contratto_id": contract_number,
                "data_attivazione": pick(record, "dataAttivazione", "data_attivazione"),
            },
        )
        imported += 1
    return imported


def _inactive_sims(records: list[dict], database: str) -> int:
    manager = SimDisattiva.objects.using(database)
    for record in records:
        manager.update_or_create(
            codice=required(record, "codice"),
            defaults={
                "tipo_sim": pick(record, "tipoSIM", "tipo_sim"),
                "numero_contratto": pick(record, "eraAssociataA", "era_associata_a"),
                "data_attivazione": pick(record, "dataAttivazione", "data_attivazione"),
                "data_disattivazione": pick(record, "dataDisattivazione", "data_disattivazione"),
            },
        )
    return len(records)


def _unactivated_sims(records: list[dict], database: str) -> int:
    manager = SimNonAttiva.objects.using(database)
    for record in records:
        manager.update_or_create(
            codice=required(record, "codice"),
            defaults={"tipo_sim": pick(record, "tipoSIM", "tipo_sim")},
        )
    return len(records)


def _calls(records: list[dict], database: str) -> int:
    manager = Telefonata.objects.using(database)
    available_contracts = _available_contracts(
        records,
        database,
        "effettuataDa",
        "effettuata_da",
    )
    imported = 0
    for record in records:
        contract_number = required(record, "effettuataDa", "effettuata_da")
        if contract_number not in available_contracts:
            # Evita una foreign key orfana quando si importa solo un campione.
            continue
        cost = pick(record, "costo")
        manager.update_or_create(
            id=required(record, "id"),
            defaults={
                "contratto_id": contract_number,
                "data": pick(record, "data"),
                "ora": pick(record, "ora"),
                "durata": pick(record, "durata"),
                "costo": Decimal(str(cost)) if cost is not None else None,
            },
        )
        imported += 1
    return imported


def _available_contracts(
    records: list[dict],
    database: str,
    *field_names: str,
) -> set[str]:
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
