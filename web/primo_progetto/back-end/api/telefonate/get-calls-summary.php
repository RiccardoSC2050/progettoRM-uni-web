<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";

$year = filter_input(INPUT_GET, "year", FILTER_VALIDATE_INT);
$mode = trim($_GET["mode"] ?? "full");

if (!$year) {
    $yearSql = "
        SELECT YEAR(MAX(data)) AS anno
        FROM Telefonata
    ";

    $yearResult = $conn->query($yearSql);
    $yearRow = $yearResult ? $yearResult->fetch_assoc() : null;
    $year = (int) ($yearRow["anno"] ?? date("Y"));
}

$summarySql = "
    SELECT
        COUNT(*) AS totaleTelefonate,
        COALESCE(SUM(costo), 0) AS entrateTotali,
        COALESCE(AVG(costo), 0) AS costoMedio,
        COALESCE(SUM(durata), 0) AS durataTotale,
        COALESCE(AVG(durata), 0) AS durataMedia,
        COUNT(DISTINCT effettuataDa) AS contrattiCoinvolti
    FROM Telefonata
";

$summaryResult = $conn->query($summarySql);

if (!$summaryResult) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$summary = $summaryResult->fetch_assoc();

$yearsSql = "
    SELECT DISTINCT YEAR(data) AS anno
    FROM Telefonata
    ORDER BY anno DESC
";

$yearsResult = $conn->query($yearsSql);

if (!$yearsResult) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$years = [];

while ($row = $yearsResult->fetch_assoc()) {
    $years[] = (int) $row["anno"];
}

$monthlySql = "
    SELECT
        MONTH(data) AS mese,
        COUNT(*) AS telefonate,
        COALESCE(SUM(costo), 0) AS entrate
    FROM Telefonata
    WHERE YEAR(data) = ?
    GROUP BY MONTH(data)
    ORDER BY mese ASC
";

$monthlyStmt = $conn->prepare($monthlySql);

if (!$monthlyStmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$monthlyStmt->bind_param("i", $year);
$monthlyStmt->execute();
$monthlyResult = $monthlyStmt->get_result();

$monthlyMap = [];

while ($row = $monthlyResult->fetch_assoc()) {
    $monthlyMap[(int) $row["mese"]] = [
        "mese" => (int) $row["mese"],
        "telefonate" => (int) $row["telefonate"],
        "entrate" => (float) $row["entrate"]
    ];
}

$monthlyStmt->close();

$monthly = [];

for ($month = 1; $month <= 12; $month++) {
    $monthly[] = $monthlyMap[$month] ?? [
        "mese" => $month,
        "telefonate" => 0,
        "entrate" => 0
    ];
}

if ($mode === "chart") {
    echo json_encode([
        "success" => true,
        "data" => [
            "year" => $year,
            "years" => $years,
            "monthly" => $monthly
        ]
    ]);
    exit;
}

$latestSql = "
    SELECT
        id,
        effettuataDa,
        data,
        ora,
        durata,
        costo
    FROM Telefonata
    ORDER BY data DESC, ora DESC, id DESC
    LIMIT 5
";

$latestResult = $conn->query($latestSql);

if (!$latestResult) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$latest = [];

while ($row = $latestResult->fetch_assoc()) {
    $latest[] = [
        "id" => (int) $row["id"],
        "effettuataDa" => $row["effettuataDa"],
        "data" => $row["data"],
        "ora" => $row["ora"],
        "durata" => (int) $row["durata"],
        "costo" => (float) $row["costo"]
    ];
}

echo json_encode([
    "success" => true,
    "data" => [
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
        "latest" => $latest
    ]
]);
