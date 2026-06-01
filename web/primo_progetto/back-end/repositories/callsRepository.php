<?php

function fetchLatestCallYear(mysqli $conn): int
{
    $result = $conn->query("SELECT YEAR(MAX(data)) AS anno FROM telefonata");

    if (!$result) {
        throw new RuntimeException($conn->error);
    }

    $row = $result->fetch_assoc();
    return (int) ($row["anno"] ?? date("Y"));
}

function fetchCallsSummary(mysqli $conn, int $year, string $mode = "full"): array
{
    $summaryResult = $conn->query("
        SELECT
            COUNT(*) AS totaleTelefonate,
            COALESCE(SUM(costo), 0) AS entrateTotali,
            COALESCE(AVG(costo), 0) AS costoMedio,
            COALESCE(SUM(durata), 0) AS durataTotale,
            COALESCE(AVG(durata), 0) AS durataMedia,
            COUNT(DISTINCT effettuataDa) AS contrattiCoinvolti
        FROM telefonata
    ");

    if (!$summaryResult) {
        throw new RuntimeException($conn->error);
    }

    $summary = $summaryResult->fetch_assoc();
    $yearsResult = $conn->query("
        SELECT DISTINCT YEAR(data) AS anno
        FROM telefonata
        ORDER BY anno DESC
    ");

    if (!$yearsResult) {
        throw new RuntimeException($conn->error);
    }

    $years = [];

    while ($row = $yearsResult->fetch_assoc()) {
        $years[] = (int) $row["anno"];
    }

    $monthlyStmt = $conn->prepare("
        SELECT
            MONTH(data) AS mese,
            COUNT(*) AS telefonate,
            COALESCE(SUM(costo), 0) AS entrate
        FROM telefonata
        WHERE YEAR(data) = ?
        GROUP BY MONTH(data)
        ORDER BY mese ASC
    ");

    if (!$monthlyStmt) {
        throw new RuntimeException($conn->error);
    }

    $monthlyStmt->bind_param("i", $year);

    if (!$monthlyStmt->execute()) {
        throw new RuntimeException($monthlyStmt->error);
    }

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
        return [
            "year" => $year,
            "years" => $years,
            "monthly" => $monthly
        ];
    }

    $latestResult = $conn->query("
        SELECT id, effettuataDa, data, ora, durata, costo
        FROM telefonata
        ORDER BY data DESC, ora DESC, id DESC
        LIMIT 5
    ");

    if (!$latestResult) {
        throw new RuntimeException($conn->error);
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
        "latest" => $latest
    ];
}

function fetchCalls(mysqli $conn, array $filters): array
{
    $q = $filters["q"] ?? "";
    $data = $filters["data"] ?? "";
    $costoMin = $filters["costoMin"] ?? null;
    $costoMax = $filters["costoMax"] ?? null;
    $durataMin = $filters["durataMin"] ?? null;
    $limit = $filters["limit"] ?? 15;
    $offset = $filters["offset"] ?? 0;
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

    if ($data !== "") {
        $where[] = "t.data = ?";
        $params[] = $data;
        $types .= "s";
    }

    if ($costoMin !== null) {
        $where[] = "t.costo >= ?";
        $params[] = $costoMin;
        $types .= "d";
    }

    if ($costoMax !== null) {
        $where[] = "t.costo <= ?";
        $params[] = $costoMax;
        $types .= "d";
    }

    if ($durataMin !== null) {
        $where[] = "t.durata >= ?";
        $params[] = $durataMin;
        $types .= "i";
    }

    $whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";
    $countStmt = $conn->prepare("
        SELECT
            COUNT(*) AS totale,
            COALESCE(SUM(t.costo), 0) AS entrateTotali
        FROM telefonata t
        $whereSql
    ");

    if (!$countStmt) {
        throw new RuntimeException($conn->error);
    }

    if ($types !== "") {
        $countStmt->bind_param($types, ...$params);
    }

    if (!$countStmt->execute()) {
        throw new RuntimeException($countStmt->error);
    }

    $countRow = $countStmt->get_result()->fetch_assoc();
    $totale = (int) $countRow["totale"];
    $entrateTotali = (float) $countRow["entrateTotali"];
    $countStmt->close();

    $stmt = $conn->prepare("
        SELECT
            t.id,
            t.effettuataDa,
            t.data,
            t.ora,
            t.durata,
            t.costo,
            ct.tipo AS tipoContratto
        FROM telefonata t
        LEFT JOIN contrattotelefonico ct
            ON ct.numero = t.effettuataDa
        $whereSql
        ORDER BY t.data DESC, t.ora DESC, t.id DESC
        LIMIT ? OFFSET ?
    ");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $listParams = $params;
    $listParams[] = $limit;
    $listParams[] = $offset;
    $stmt->bind_param($types . "ii", ...$listParams);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

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

    return [
        "totale" => $totale,
        "limite" => $limit,
        "offset" => $offset,
        "hasNext" => $offset + $limit < $totale,
        "hasPrevious" => $offset - $limit >= 0,
        "summary" => [
            "entrateTotali" => $entrateTotali
        ],
        "telefonate" => $telefonate
    ];
}
