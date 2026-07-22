<?php

function fetchContractDetail(mysqli $conn, string $numero): ?array
{
    $row = dbFetchOne(
        $conn,
        "
            SELECT
                ct.numero,
                ct.dataAttivazione,
                ct.tipo,
                ct.minutiResidui,
                ct.creditoResiduo,
                sa.codice AS codiceSIM,
                sa.tipoSIM,
                sa.dataAttivazione AS dataAttivazioneSIM,
                COALESCE(tel.numeroTelefonate, 0) AS numeroTelefonate,
                COALESCE(tel.durataTotale, 0) AS durataTotale,
                COALESCE(tel.costoTotale, 0) AS costoTotale
            FROM `ContrattoTelefonico` ct
            LEFT JOIN `SIMAttiva` sa ON sa.associataA = ct.numero
            LEFT JOIN (
                SELECT
                    effettuataDa,
                    COUNT(*) AS numeroTelefonate,
                    SUM(durata) AS durataTotale,
                    SUM(costo) AS costoTotale
                FROM `Telefonata`
                GROUP BY effettuataDa
            ) tel ON tel.effettuataDa = ct.numero
            WHERE ct.numero = ?
            LIMIT 1
        ",
        "s",
        [$numero]
    );

    if (!$row) {
        return null;
    }

    return [
        "numero" => $row["numero"],
        "dataAttivazione" => $row["dataAttivazione"],
        "tipo" => $row["tipo"],
        "minutiResidui" => $row["minutiResidui"] !== null ? (int) $row["minutiResidui"] : null,
        "creditoResiduo" => $row["creditoResiduo"] !== null ? (float) $row["creditoResiduo"] : null,
        "codiceSIM" => $row["codiceSIM"],
        "tipoSIM" => $row["tipoSIM"],
        "dataAttivazioneSIM" => $row["dataAttivazioneSIM"],
        "numeroTelefonate" => (int) $row["numeroTelefonate"],
        "durataTotale" => (int) $row["durataTotale"],
        "costoTotale" => (float) $row["costoTotale"]
    ];
}