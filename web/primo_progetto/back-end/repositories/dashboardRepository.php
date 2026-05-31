<?php

function fetchDashboardSummary(mysqli $conn): array
{
    $summary = [];
    $queries = [
        "contratti" => "SELECT COUNT(*) AS totale FROM ContrattoTelefonico",
        "simAttive" => "SELECT COUNT(*) AS totale FROM SIMAttiva",
        "simDisattive" => "SELECT COUNT(*) AS totale FROM SIMDisattiva",
        "simNonAttive" => "SELECT COUNT(*) AS totale FROM SIMNonAttiva",
        "telefonate" => "SELECT COUNT(*) AS totale FROM Telefonata"
    ];

    foreach ($queries as $key => $sql) {
        $result = $conn->query($sql);

        if (!$result) {
            throw new RuntimeException($conn->error);
        }

        $row = $result->fetch_assoc();
        $summary[$key] = (int) $row["totale"];
    }

    return $summary;
}
