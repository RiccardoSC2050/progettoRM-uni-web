<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";

$q = trim($_GET["q"] ?? "");
$tipo = trim($_GET["tipo"] ?? "");
$data = trim($_GET["data"] ?? "");
$sort = trim($_GET["sort"] ?? "dataAttivazione");
$direction = strtolower(trim($_GET["direction"] ?? "desc"));
$limit = filter_input(INPUT_GET, "limit", FILTER_VALIDATE_INT) ?: 5;
$offset = filter_input(INPUT_GET, "offset", FILTER_VALIDATE_INT) ?: 0;

$limit = max(1, min($limit, 30));
$offset = max(0, $offset);
$directionSql = $direction === "asc" ? "ASC" : "DESC";

$sortMap = [
    "numero" => "ct.numero",
    "dataAttivazione" => "ct.dataAttivazione",
    "telefonate" => "numeroTelefonate"
];

$orderColumn = $sortMap[$sort] ?? $sortMap["dataAttivazione"];

$where = [];
$params = [];
$types = "";

if ($q !== "") {
    $where[] = "ct.numero LIKE ?";
    $params[] = "%" . $q . "%";
    $types .= "s";
}

if ($tipo === "ricarica" || $tipo === "consumo") {
    $where[] = "ct.tipo = ?";
    $params[] = $tipo;
    $types .= "s";
}

if ($data !== "" && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
    $where[] = "ct.dataAttivazione = ?";
    $params[] = $data;
    $types .= "s";
}

$whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

$countSql = "
    SELECT COUNT(*) AS totale
    FROM ContrattoTelefonico ct
    $whereSql
";

$countStmt = $conn->prepare($countSql);

if (!$countStmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

if ($types !== "") {
    $countStmt->bind_param($types, ...$params);
}

$countStmt->execute();
$countResult = $countStmt->get_result();
$countRow = $countResult->fetch_assoc();
$totale = (int) $countRow["totale"];
$countStmt->close();

$summarySql = "
    SELECT
        COUNT(*) AS totale,
        SUM(CASE WHEN ct.tipo = 'ricarica' THEN 1 ELSE 0 END) AS ricarica,
        SUM(CASE WHEN ct.tipo = 'consumo' THEN 1 ELSE 0 END) AS consumo,
        SUM(CASE WHEN sa.codice IS NULL THEN 1 ELSE 0 END) AS senzaSIM
    FROM ContrattoTelefonico ct
    LEFT JOIN SIMAttiva sa
        ON sa.associataA = ct.numero
    $whereSql
";

$summaryStmt = $conn->prepare($summarySql);

if (!$summaryStmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

if ($types !== "") {
    $summaryStmt->bind_param($types, ...$params);
}

$summaryStmt->execute();
$summaryResult = $summaryStmt->get_result();
$summaryRow = $summaryResult->fetch_assoc();
$summaryStmt->close();

$sql = "
    SELECT
        ct.numero,
        ct.dataAttivazione,
        ct.tipo,
        ct.minutiResidui,
        ct.creditoResiduo,
        sa.codice AS codiceSIM,
        sa.tipoSIM,
        (
            SELECT COUNT(*)
            FROM Telefonata tel
            WHERE tel.effettuataDa = ct.numero
        ) AS numeroTelefonate
    FROM ContrattoTelefonico ct
    LEFT JOIN SIMAttiva sa
        ON sa.associataA = ct.numero
    $whereSql
    ORDER BY $orderColumn $directionSql, ct.numero ASC
    LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$listParams = $params;
$listParams[] = $limit;
$listParams[] = $offset;
$listTypes = $types . "ii";

$stmt->bind_param($listTypes, ...$listParams);
$stmt->execute();
$result = $stmt->get_result();
$contratti = [];

while ($row = $result->fetch_assoc()) {
    $contratti[] = [
        "numero" => $row["numero"],
        "dataAttivazione" => $row["dataAttivazione"],
        "tipo" => $row["tipo"],
        "minutiResidui" => $row["minutiResidui"] !== null ? (int) $row["minutiResidui"] : null,
        "creditoResiduo" => $row["creditoResiduo"] !== null ? (float) $row["creditoResiduo"] : null,
        "codiceSIM" => $row["codiceSIM"],
        "tipoSIM" => $row["tipoSIM"],
        "numeroTelefonate" => (int) $row["numeroTelefonate"]
    ];
}

$stmt->close();

$nextOffset = $offset + $limit;
$previousOffset = $offset - $limit;

echo json_encode([
    "success" => true,
    "data" => [
        "totale" => $totale,
        "limite" => $limit,
        "offset" => $offset,
        "hasNext" => $nextOffset < $totale,
        "hasPrevious" => $previousOffset >= 0,
        "summary" => [
            "totale" => (int) ($summaryRow["totale"] ?? 0),
            "ricarica" => (int) ($summaryRow["ricarica"] ?? 0),
            "consumo" => (int) ($summaryRow["consumo"] ?? 0),
            "senzaSIM" => (int) ($summaryRow["senzaSIM"] ?? 0)
        ],
        "contratti" => $contratti
    ]
]);
