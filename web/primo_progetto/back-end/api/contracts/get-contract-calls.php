<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";

$numero = trim($_GET["numero"] ?? "");
$id = trim($_GET["id"] ?? "");
$data = trim($_GET["data"] ?? "");
$minDurata = filter_input(INPUT_GET, "minDurata", FILTER_VALIDATE_INT);
$maxCosto = filter_input(INPUT_GET, "maxCosto", FILTER_VALIDATE_FLOAT);
$limit = filter_input(INPUT_GET, "limit", FILTER_VALIDATE_INT) ?: 5;
$offset = filter_input(INPUT_GET, "offset", FILTER_VALIDATE_INT) ?: 0;

$limit = max(1, min($limit, 5));
$offset = max(0, $offset);

if ($numero === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Numero contratto mancante."]);
    exit;
}

$where = ["effettuataDa = ?"];
$params = [$numero];
$types = "s";

if ($id !== "") {
    $where[] = "CAST(id AS CHAR) LIKE ?";
    $params[] = "%" . $id . "%";
    $types .= "s";
}

if ($data !== "" && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
    $where[] = "data = ?";
    $params[] = $data;
    $types .= "s";
}

if ($minDurata !== false && $minDurata !== null) {
    $where[] = "durata >= ?";
    $params[] = $minDurata;
    $types .= "i";
}

if ($maxCosto !== false && $maxCosto !== null) {
    $where[] = "costo <= ?";
    $params[] = $maxCosto;
    $types .= "d";
}

$whereSql = "WHERE " . implode(" AND ", $where);

$countSql = "SELECT COUNT(*) AS totale FROM Telefonata $whereSql";
$countStmt = $conn->prepare($countSql);

if (!$countStmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$countStmt->bind_param($types, ...$params);
$countStmt->execute();
$countResult = $countStmt->get_result();
$countRow = $countResult->fetch_assoc();
$totale = (int) $countRow["totale"];
$countStmt->close();

$sql = "
    SELECT id, data, ora, durata, costo
    FROM Telefonata
    $whereSql
    ORDER BY data DESC, ora DESC, id DESC
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
$telefonate = [];

while ($row = $result->fetch_assoc()) {
    $telefonate[] = [
        "id" => (int) $row["id"],
        "data" => $row["data"],
        "ora" => $row["ora"],
        "durata" => (int) $row["durata"],
        "costo" => (float) $row["costo"]
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
        "telefonate" => $telefonate
    ]
]);
