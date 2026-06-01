<?php

function fetchSim(mysqli $conn, array $filters): array
{
    $limit = $filters["limit"] ?? 5;
    $offset = $filters["offset"] ?? 0;
    $unionSql = buildSimUnionSql();
    $filterData = buildSimFilters($filters);
    $whereSql = $filterData["sql"];
    $params = $filterData["params"];
    $types = $filterData["types"];

    $countStmt = $conn->prepare("SELECT COUNT(*) AS totale FROM ($unionSql) sim $whereSql");

    if (!$countStmt) {
        throw new RuntimeException($conn->error);
    }

    bindSimParams($countStmt, $types, $params);

    if (!$countStmt->execute()) {
        throw new RuntimeException($countStmt->error);
    }

    $totale = (int) ($countStmt->get_result()->fetch_assoc()["totale"] ?? 0);
    $countStmt->close();

    $summaryResult = $conn->query("
        SELECT
            (SELECT COUNT(*) FROM simattiva) AS attive,
            (SELECT COUNT(*) FROM simdisattiva) AS disattive,
            (SELECT COUNT(*) FROM simnonattiva) AS nonAttive,
            (SELECT COUNT(*) FROM simattiva) + (SELECT COUNT(*) FROM simdisattiva) + (SELECT COUNT(*) FROM simnonattiva) AS totale,
            (SELECT COUNT(*) FROM ($unionSql) sim WHERE sim.tipoSIM = 'standard') AS standard,
            (SELECT COUNT(*) FROM ($unionSql) sim WHERE sim.tipoSIM = 'microSIM') AS microSIM,
            (SELECT COUNT(*) FROM ($unionSql) sim WHERE sim.tipoSIM = 'nanoSIM') AS nanoSIM,
            (SELECT COUNT(*) FROM ($unionSql) sim WHERE sim.tipoSIM = 'eSIM') AS eSIM
    ");

    if (!$summaryResult) {
        throw new RuntimeException($conn->error);
    }

    $summaryRow = $summaryResult->fetch_assoc();
    $summaryResult->free();

    $stmt = $conn->prepare("
        SELECT codice, tipoSIM, contratto, dataAttivazione, dataDisattivazione, stato
        FROM ($unionSql) sim
        $whereSql
        ORDER BY FIELD(sim.stato, 'attiva', 'disattiva', 'non_attiva'), sim.codice ASC
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
    $items = [];

    while ($row = $result->fetch_assoc()) {
        $items[] = [
            "codice" => $row["codice"],
            "tipoSIM" => $row["tipoSIM"],
            "contratto" => $row["contratto"],
            "dataAttivazione" => $row["dataAttivazione"],
            "dataDisattivazione" => $row["dataDisattivazione"],
            "stato" => $row["stato"]
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
            "totale" => (int) ($summaryRow["totale"] ?? 0),
            "attive" => (int) ($summaryRow["attive"] ?? 0),
            "disattive" => (int) ($summaryRow["disattive"] ?? 0),
            "nonAttive" => (int) ($summaryRow["nonAttive"] ?? 0),
            "standard" => (int) ($summaryRow["standard"] ?? 0),
            "microSIM" => (int) ($summaryRow["microSIM"] ?? 0),
            "nanoSIM" => (int) ($summaryRow["nanoSIM"] ?? 0),
            "eSIM" => (int) ($summaryRow["eSIM"] ?? 0)
        ],
        "sim" => $items
    ];
}

function getSimByCode(mysqli $conn, string $codice): ?array
{
    $stmt = $conn->prepare("
        SELECT codice, tipoSIM, contratto, dataAttivazione, dataDisattivazione, stato
        FROM (" . buildSimUnionSql() . ") sim
        WHERE codice = ?
        LIMIT 1
    ");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $codice);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $row ?: null;
}
