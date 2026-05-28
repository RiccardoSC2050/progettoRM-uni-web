<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";

$q = trim($_GET["q"] ?? "");
$tipo = trim($_GET["tipoSIM"] ?? "");
$data = trim($_GET["dataDisattivazione"] ?? "");
$limit = filter_input(INPUT_GET, "limit", FILTER_VALIDATE_INT) ?: 5;
$offset = filter_input(INPUT_GET, "offset", FILTER_VALIDATE_INT) ?: 0;

$limit = max(1, min($limit, 15));
$offset = max(0, $offset);

$where = [];
$params = [];
$types = "";

if ($q !== "") {
    $where[] = "(sd.codice LIKE ? OR sd.eraAssociataA LIKE ?)";
    $params[] = "%" . $q . "%";
    $params[] = "%" . $q . "%";
    $types .= "ss";
}

if (in_array($tipo, ["standard", "microSIM", "nanoSIM", "eSIM"], true)) {
    $where[] = "sd.tipoSIM = ?";
    $params[] = $tipo;
    $types .= "s";
}

if ($data !== "" && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
    $where[] = "sd.dataDisattivazione = ?";
    $params[] = $data;
    $types .= "s";
}

$whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

$countSql = "SELECT COUNT(*) AS totale FROM SIMDisattiva sd $whereSql";
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
$countRow = $countStmt->get_result()->fetch_assoc();
$totale = (int) ($countRow["totale"] ?? 0);
$countStmt->close();

$summarySql = "
    SELECT
        COUNT(*) AS totale,
        SUM(CASE WHEN tipoSIM = 'standard' THEN 1 ELSE 0 END) AS standard,
        SUM(CASE WHEN tipoSIM = 'microSIM' THEN 1 ELSE 0 END) AS microSIM,
        SUM(CASE WHEN tipoSIM = 'nanoSIM' THEN 1 ELSE 0 END) AS nanoSIM,
        SUM(CASE WHEN tipoSIM = 'eSIM' THEN 1 ELSE 0 END) AS eSIM
    FROM SIMDisattiva
";

$summaryResult = $conn->query($summarySql);

if (!$summaryResult) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$summaryRow = $summaryResult->fetch_assoc();

$sql = "
    SELECT codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione
    FROM SIMDisattiva sd
    $whereSql
    ORDER BY sd.dataDisattivazione DESC, sd.codice ASC
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
$items = [];

while ($row = $result->fetch_assoc()) {
    $items[] = [
        "codice" => $row["codice"],
        "tipoSIM" => $row["tipoSIM"],
        "eraAssociataA" => $row["eraAssociataA"],
        "dataAttivazione" => $row["dataAttivazione"],
        "dataDisattivazione" => $row["dataDisattivazione"]
    ];
}

$stmt->close();

echo json_encode([
    "success" => true,
    "data" => [
        "totale" => $totale,
        "limite" => $limit,
        "offset" => $offset,
        "hasNext" => $offset + $limit < $totale,
        "hasPrevious" => $offset - $limit >= 0,
        "summary" => [
            "totale" => (int) ($summaryRow["totale"] ?? 0),
            "standard" => (int) ($summaryRow["standard"] ?? 0),
            "microSIM" => (int) ($summaryRow["microSIM"] ?? 0),
            "nanoSIM" => (int) ($summaryRow["nanoSIM"] ?? 0),
            "eSIM" => (int) ($summaryRow["eSIM"] ?? 0)
        ],
        "sim" => $items
    ]
]);
