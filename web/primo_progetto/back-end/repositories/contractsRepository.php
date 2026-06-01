<?php

function bindContractParams(mysqli_stmt $stmt, string $types, array $params): void
{
    if ($types !== "") {
        $stmt->bind_param($types, ...$params);
    }
}

function fetchContracts(mysqli $conn, array $filters): array
{
    $q = $filters["q"] ?? "";
    $tipo = $filters["tipo"] ?? "";
    $data = $filters["data"] ?? "";
    $sort = $filters["sort"] ?? "dataAttivazione";
    $direction = $filters["direction"] ?? "desc";
    $limit = $filters["limit"] ?? 5;
    $offset = $filters["offset"] ?? 0;
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

    if ($data !== "") {
        $where[] = "ct.dataAttivazione = ?";
        $params[] = $data;
        $types .= "s";
    }

    $whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

    $countSql = "
        SELECT COUNT(*) AS totale
        FROM contrattotelefonico ct
        $whereSql
    ";

    $countStmt = $conn->prepare($countSql);

    if (!$countStmt) {
        throw new RuntimeException($conn->error);
    }

    bindContractParams($countStmt, $types, $params);

    if (!$countStmt->execute()) {
        throw new RuntimeException($countStmt->error);
    }

    $countRow = $countStmt->get_result()->fetch_assoc();
    $totale = (int) $countRow["totale"];
    $countStmt->close();

    $summarySql = "
        SELECT
            COUNT(*) AS totale,
            SUM(CASE WHEN ct.tipo = 'ricarica' THEN 1 ELSE 0 END) AS ricarica,
            SUM(CASE WHEN ct.tipo = 'consumo' THEN 1 ELSE 0 END) AS consumo,
            SUM(CASE WHEN sa.codice IS NULL THEN 1 ELSE 0 END) AS senzaSIM
        FROM contrattotelefonico ct
        LEFT JOIN simattiva sa
            ON sa.associataA = ct.numero
        $whereSql
    ";

    $summaryStmt = $conn->prepare($summarySql);

    if (!$summaryStmt) {
        throw new RuntimeException($conn->error);
    }

    bindContractParams($summaryStmt, $types, $params);

    if (!$summaryStmt->execute()) {
        throw new RuntimeException($summaryStmt->error);
    }

    $summaryRow = $summaryStmt->get_result()->fetch_assoc();
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
                FROM telefonata tel
                WHERE tel.effettuataDa = ct.numero
            ) AS numeroTelefonate
        FROM contrattotelefonico ct
        LEFT JOIN simattiva sa
            ON sa.associataA = ct.numero
        $whereSql
        ORDER BY $orderColumn $directionSql, ct.numero ASC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);

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

    return [
        "totale" => $totale,
        "limite" => $limit,
        "offset" => $offset,
        "hasNext" => $offset + $limit < $totale,
        "hasPrevious" => $offset - $limit >= 0,
        "summary" => [
            "totale" => (int) ($summaryRow["totale"] ?? 0),
            "ricarica" => (int) ($summaryRow["ricarica"] ?? 0),
            "consumo" => (int) ($summaryRow["consumo"] ?? 0),
            "senzaSIM" => (int) ($summaryRow["senzaSIM"] ?? 0)
        ],
        "contratti" => $contratti
    ];
}

function fetchContractDetail(mysqli $conn, string $numero): ?array
{
    $sql = "
        SELECT
            ct.numero,
            ct.dataAttivazione,
            ct.tipo,
            ct.minutiResidui,
            ct.creditoResiduo,
            sa.codice AS codiceSIM,
            sa.tipoSIM,
            sa.dataAttivazione AS dataAttivazioneSIM,
            COALESCE(tel.numeroTelefonate, 0) AS numeroTelefonate,
            COALESCE(tel.durataTotale, 0) AS durataTotale,
            COALESCE(tel.costoTotale, 0) AS costoTotale
        FROM contrattotelefonico ct
        LEFT JOIN simattiva sa
            ON sa.associataA = ct.numero
        LEFT JOIN (
            SELECT
                effettuataDa,
                COUNT(*) AS numeroTelefonate,
                SUM(durata) AS durataTotale,
                SUM(costo) AS costoTotale
            FROM telefonata
            GROUP BY effettuataDa
        ) tel
            ON tel.effettuataDa = ct.numero
        WHERE ct.numero = ?
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $numero);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        return null;
    }

    return [
        "numero" => $row["numero"],
        "dataAttivazione" => $row["dataAttivazione"],
        "tipo" => $row["tipo"],
        "minutiResidui" => $row["minutiResidui"] !== null ? (int) $row["minutiResidui"] : null,
        "creditoResiduo" => $row["creditoResiduo"] !== null ? (float) $row["creditoResiduo"] : null,
        "codiceSIM" => $row["codiceSIM"],
        "tipoSIM" => $row["tipoSIM"],
        "dataAttivazioneSIM" => $row["dataAttivazioneSIM"],
        "numeroTelefonate" => (int) $row["numeroTelefonate"],
        "durataTotale" => (int) $row["durataTotale"],
        "costoTotale" => (float) $row["costoTotale"]
    ];
}

function fetchContractCalls(mysqli $conn, array $filters): array
{
    $numero = $filters["numero"] ?? "";
    $id = $filters["id"] ?? "";
    $data = $filters["data"] ?? "";
    $minDurata = $filters["minDurata"] ?? null;
    $maxCosto = $filters["maxCosto"] ?? null;
    $limit = $filters["limit"] ?? 5;
    $offset = $filters["offset"] ?? 0;
    $where = ["effettuataDa = ?"];
    $params = [$numero];
    $types = "s";

    if ($id !== "") {
        $where[] = "CAST(id AS CHAR) LIKE ?";
        $params[] = "%" . $id . "%";
        $types .= "s";
    }

    if ($data !== "") {
        $where[] = "data = ?";
        $params[] = $data;
        $types .= "s";
    }

    if ($minDurata !== null) {
        $where[] = "durata >= ?";
        $params[] = $minDurata;
        $types .= "i";
    }

    if ($maxCosto !== null) {
        $where[] = "costo <= ?";
        $params[] = $maxCosto;
        $types .= "d";
    }

    $whereSql = "WHERE " . implode(" AND ", $where);
    $countStmt = $conn->prepare("SELECT COUNT(*) AS totale FROM telefonata $whereSql");

    if (!$countStmt) {
        throw new RuntimeException($conn->error);
    }

    $countStmt->bind_param($types, ...$params);

    if (!$countStmt->execute()) {
        throw new RuntimeException($countStmt->error);
    }

    $totale = (int) $countStmt->get_result()->fetch_assoc()["totale"];
    $countStmt->close();

    $sql = "
        SELECT id, data, ora, durata, costo
        FROM telefonata
        $whereSql
        ORDER BY data DESC, ora DESC, id DESC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);

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
            "data" => $row["data"],
            "ora" => $row["ora"],
            "durata" => (int) $row["durata"],
            "costo" => (float) $row["costo"]
        ];
    }

    $stmt->close();

    return [
        "totale" => $totale,
        "limite" => $limit,
        "offset" => $offset,
        "hasNext" => $offset + $limit < $totale,
        "hasPrevious" => $offset - $limit >= 0,
        "telefonate" => $telefonate
    ];
}
