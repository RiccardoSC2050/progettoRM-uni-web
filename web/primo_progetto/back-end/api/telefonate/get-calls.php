<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";

$q = trim($_GET["q"] ?? "");
$data = trim($_GET["data"] ?? "");
$costoMin = filter_input(INPUT_GET, "costoMin", FILTER_VALIDATE_FLOAT);
$costoMax = filter_input(INPUT_GET, "costoMax", FILTER_VALIDATE_FLOAT);
$durataMin = filter_input(INPUT_GET, "durataMin", FILTER_VALIDATE_INT);
$limit = filter_input(INPUT_GET, "limit", FILTER_VALIDATE_INT) ?: 15;
$offset = filter_input(INPUT_GET, "offset", FILTER_VALIDATE_INT) ?: 0;

$limit = max(1, min($limit, 30));
$offset = max(0, $offset);

$where = [];
$params = [];
$types = "";

if ($q !== "") {
    $where[] = "(CAST(t.id AS CHAR) LIKE ? OR t.effettuataDa LIKE ?)";
    $like = "%" . $q . "%";
    $params[] = $like;
    $params[] = $like;
    $types .= "ss";
}

if ($data !== "" && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
    $where[] = "t.data = ?";
    $params[] = $data;
    $types .= "s";
}

if ($costoMin !== false && $costoMin !== null) {
    $where[] = "t.costo >= ?";
    $params[] = $costoMin;
    $types .= "d";
}

if ($costoMax !== false && $costoMax !== null) {
    $where[] = "t.costo <= ?";
    $params[] = $costoMax;
    $types .= "d";
}

if ($durataMin !== false && $durataMin !== null) {
    $where[] = "t.durata >= ?";
    $params[] = $durataMin;
    $types .= "i";
}

$whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

$countSql = "
    SELECT
        COUNT(*) AS totale,
        COALESCE(SUM(t.costo), 0) AS entrateTotali
    FROM Telefonata t
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
$entrateTotali = (float) $countRow["entrateTotali"];
$countStmt->close();

$sql = "
    SELECT
        t.id,
        t.effettuataDa,
        t.data,
        t.ora,
        t.durata,
        t.costo,
        ct.tipo AS tipoContratto
    FROM Telefonata t
    LEFT JOIN ContrattoTelefonico ct
        ON ct.numero = t.effettuataDa
    $whereSql
    ORDER BY t.data DESC, t.ora DESC, t.id DESC
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
        "effettuataDa" => $row["effettuataDa"],
        "data" => $row["data"],
        "ora" => $row["ora"],
        "durata" => (int) $row["durata"],
        "costo" => (float) $row["costo"],
        "tipoContratto" => $row["tipoContratto"]
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
            "entrateTotali" => $entrateTotali
        ],
        "telefonate" => $telefonate
    ]
]);
