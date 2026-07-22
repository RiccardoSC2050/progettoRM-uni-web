<?php

function fetchLatestCallYear(mysqli $conn): int
{
    $row = dbQueryOne($conn, "SELECT YEAR(MAX(data)) AS anno FROM `Telefonata`");

    return (int) ($row["anno"] ?? date("Y"));
}

function fetchCallYears(mysqli $conn): array
{
    $rows = dbQueryAll(
        $conn,
        "
            SELECT DISTINCT YEAR(data) AS anno
            FROM `Telefonata`
            ORDER BY anno DESC
        "
    );

    return array_map(fn(array $row): int => (int) $row["anno"], $rows);
}

function fetchCallMonthlyStats(mysqli $conn, int $year): array
{
    $rows = dbFetchAll(
        $conn,
        "
            SELECT
                MONTH(data) AS mese,
                COUNT(*) AS telefonate,
                COALESCE(SUM(costo), 0) AS entrate
            FROM `Telefonata`
            WHERE YEAR(data) = ?
            GROUP BY MONTH(data)
            ORDER BY mese ASC
        ",
        "i",
        [$year]
    );

    $monthlyMap = [];

    foreach ($rows as $row) {
        $monthlyMap[(int) $row["mese"]] = [
            "mese" => (int) $row["mese"],
            "telefonate" => (int) $row["telefonate"],
            "entrate" => (float) $row["entrate"]
        ];
    }

    $monthly = [];

    for ($month = 1; $month <= 12; $month++) {
        $monthly[] = $monthlyMap[$month] ?? [
            "mese" => $month,
            "telefonate" => 0,
            "entrate" => 0
        ];
    }

    return $monthly;
}

function fetchLatestCalls(mysqli $conn): array
{
    $rows = dbQueryAll(
        $conn,
        "
            SELECT id, effettuataDa, data, ora, durata, costo
            FROM `Telefonata`
            ORDER BY data DESC, ora DESC, id DESC
            LIMIT 5
        "
    );

    return array_map(fn(array $row): array => [
        "id" => (int) $row["id"],
        "effettuataDa" => $row["effettuataDa"],
        "data" => $row["data"],
        "ora" => $row["ora"],
        "durata" => (int) $row["durata"],
        "costo" => (float) $row["costo"]
    ], $rows);
}

function fetchCallsSummary(mysqli $conn, int $year, string $mode = "full"): array
{
    $summary = dbQueryOne(
        $conn,
        "
            SELECT
                COUNT(*) AS totaleTelefonate,
                COALESCE(SUM(costo), 0) AS entrateTotali,
                COALESCE(AVG(costo), 0) AS costoMedio,
                COALESCE(SUM(durata), 0) AS durataTotale,
                COALESCE(AVG(durata), 0) AS durataMedia,
                COUNT(DISTINCT effettuataDa) AS contrattiCoinvolti
            FROM `Telefonata`
        "
    );

    $years = fetchCallYears($conn);
    $monthly = fetchCallMonthlyStats($conn, $year);

    if ($mode === "chart") {
        return [
            "year" => $year,
            "years" => $years,
            "monthly" => $monthly
        ];
    }

    return [
        "year" => $year,
        "years" => $years,
        "summary" => [
            "totaleTelefonate" => (int) $summary["totaleTelefonate"],
            "entrateTotali" => (float) $summary["entrateTotali"],
            "costoMedio" => (float) $summary["costoMedio"],
            "durataTotale" => (int) $summary["durataTotale"],
            "durataMedia" => (float) $summary["durataMedia"],
            "contrattiCoinvolti" => (int) $summary["contrattiCoinvolti"]
        ],
        "monthly" => $monthly,
        "latest" => fetchLatestCalls($conn)
    ];
}