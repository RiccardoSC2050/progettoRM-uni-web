<?php

function prepareDeactivateSimData(array $current, array $inputData): array
{
    return [
        "codiceOriginale" => $current["codice"],
        "statoOriginale" => "attiva",
        "codice" => $current["codice"],
        "tipoSIM" => $current["tipoSIM"],
        "contratto" => $current["contratto"],
        "dataAttivazione" => $current["dataAttivazione"],
        "dataDisattivazione" => getTodayForSim(),
        "statoFinale" => "disattiva"
    ];
}
