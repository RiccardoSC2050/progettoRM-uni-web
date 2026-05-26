<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";

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
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => $conn->error
        ]);
        exit;
    }

    $row = $result->fetch_assoc();
    $summary[$key] = (int) $row["totale"];
}

echo json_encode([
    "success" => true,
    "data" => $summary
]);