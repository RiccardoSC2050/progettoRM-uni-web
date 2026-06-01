<?php

function fetchDashboardSummary(mysqli $conn): array
{
    $summary = [];
    $queries = [
        "contratti" => "SELECT COUNT(*) AS totale FROM contrattotelefonico",
        "simAttive" => "SELECT COUNT(*) AS totale FROM simattiva",
        "simDisattive" => "SELECT COUNT(*) AS totale FROM simdisattiva",
        "simNonAttive" => "SELECT COUNT(*) AS totale FROM simnonattiva",
        "telefonate" => "SELECT COUNT(*) AS totale FROM telefonata"
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
