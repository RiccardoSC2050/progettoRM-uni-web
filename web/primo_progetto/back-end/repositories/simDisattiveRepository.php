<?php

function bindSimParams(mysqli_stmt $stmt, string $types, array $params): void
{
    if ($types !== "") {
        $stmt->bind_param($types, ...$params);
    }
}

function contractExistsForSim(mysqli $conn, string $numero): bool
{
    $stmt = $conn->prepare("SELECT numero FROM ContrattoTelefonico WHERE numero = ? LIMIT 1");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $numero);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $exists = $stmt->get_result()->num_rows > 0;
    $stmt->close();

    return $exists;
}

function simDisattivaExistsByCode(mysqli $conn, string $codice): bool
{
    $stmt = $conn->prepare("SELECT codice FROM SIMDisattiva WHERE codice = ? LIMIT 1");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $codice);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $exists = $stmt->get_result()->num_rows > 0;
    $stmt->close();

    return $exists;
}

function activeContractHasSim(mysqli $conn, string $numero, string $excludeCode = ""): bool
{
    $sql = $excludeCode !== ""
        ? "SELECT codice FROM SIMAttiva WHERE associataA = ? AND codice <> ? LIMIT 1"
        : "SELECT codice FROM SIMAttiva WHERE associataA = ? LIMIT 1";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    if ($excludeCode !== "") {
        $stmt->bind_param("ss", $numero, $excludeCode);
    } else {
        $stmt->bind_param("s", $numero);
    }

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $exists = $stmt->get_result()->num_rows > 0;
    $stmt->close();

    return $exists;
}

function simCodeExistsInAnyTable(mysqli $conn, string $codice, string $excludeCode = ""): bool
{
    $queries = [
        ["SELECT codice FROM SIMAttiva WHERE codice = ? LIMIT 1", "s"],
        ["SELECT codice FROM SIMNonAttiva WHERE codice = ? LIMIT 1", "s"],
        $excludeCode !== ""
            ? ["SELECT codice FROM SIMDisattiva WHERE codice = ? AND codice <> ? LIMIT 1", "ss"]
            : ["SELECT codice FROM SIMDisattiva WHERE codice = ? LIMIT 1", "s"]
    ];

    foreach ($queries as [$sql, $types]) {
        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new RuntimeException($conn->error);
        }

        if ($types === "ss") {
            $stmt->bind_param("ss", $codice, $excludeCode);
        } else {
            $stmt->bind_param("s", $codice);
        }

        if (!$stmt->execute()) {
            throw new RuntimeException($stmt->error);
        }

        $exists = $stmt->get_result()->num_rows > 0;
        $stmt->close();

        if ($exists) {
            return true;
        }
    }

    return false;
}

function fetchSimDisattive(mysqli $conn, array $filters): array
{
    $q = $filters["q"] ?? "";
    $tipo = $filters["tipoSIM"] ?? "";
    $data = $filters["dataDisattivazione"] ?? "";
    $limit = $filters["limit"] ?? 5;
    $offset = $filters["offset"] ?? 0;
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

    if ($data !== "") {
        $where[] = "sd.dataDisattivazione = ?";
        $params[] = $data;
        $types .= "s";
    }

    $whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";
    $countStmt = $conn->prepare("SELECT COUNT(*) AS totale FROM SIMDisattiva sd $whereSql");

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
            COUNT(*) AS totale,
            SUM(CASE WHEN tipoSIM = 'standard' THEN 1 ELSE 0 END) AS standard,
            SUM(CASE WHEN tipoSIM = 'microSIM' THEN 1 ELSE 0 END) AS microSIM,
            SUM(CASE WHEN tipoSIM = 'nanoSIM' THEN 1 ELSE 0 END) AS nanoSIM,
            SUM(CASE WHEN tipoSIM = 'eSIM' THEN 1 ELSE 0 END) AS eSIM
        FROM SIMDisattiva
    ");

    if (!$summaryResult) {
        throw new RuntimeException($conn->error);
    }

    $summaryRow = $summaryResult->fetch_assoc();
    $stmt = $conn->prepare("
        SELECT codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione
        FROM SIMDisattiva sd
        $whereSql
        ORDER BY sd.dataDisattivazione DESC, sd.codice ASC
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
            "eraAssociataA" => $row["eraAssociataA"],
            "dataAttivazione" => $row["dataAttivazione"],
            "dataDisattivazione" => $row["dataDisattivazione"]
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
            "standard" => (int) ($summaryRow["standard"] ?? 0),
            "microSIM" => (int) ($summaryRow["microSIM"] ?? 0),
            "nanoSIM" => (int) ($summaryRow["nanoSIM"] ?? 0),
            "eSIM" => (int) ($summaryRow["eSIM"] ?? 0)
        ],
        "sim" => $items
    ];
}

function insertSimDisattiva(mysqli $conn, array $data): void
{
    $stmt = $conn->prepare("
        INSERT INTO SIMDisattiva
            (codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione)
        VALUES
            (?, ?, ?, ?, ?)
    ");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param(
        "sssss",
        $data["codice"],
        $data["tipoSIM"],
        $data["eraAssociataA"],
        $data["dataAttivazione"],
        $data["dataDisattivazione"]
    );

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $stmt->close();
}

function deleteSimDisattivaByCode(mysqli $conn, string $codice): int
{
    $stmt = $conn->prepare("DELETE FROM SIMDisattiva WHERE codice = ?");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $codice);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $affectedRows = $stmt->affected_rows;
    $stmt->close();

    return $affectedRows;
}

function updateSimDisattivaByCode(mysqli $conn, string $codiceOriginale, array $data): int
{
    $stmt = $conn->prepare("
        UPDATE SIMDisattiva
        SET codice = ?, tipoSIM = ?, eraAssociataA = ?, dataAttivazione = ?, dataDisattivazione = ?
        WHERE codice = ?
    ");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param(
        "ssssss",
        $data["codice"],
        $data["tipoSIM"],
        $data["eraAssociataA"],
        $data["dataAttivazione"],
        $data["dataDisattivazione"],
        $codiceOriginale
    );

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $affectedRows = $stmt->affected_rows;
    $stmt->close();

    return $affectedRows;
}

function reactivateSimDisattiva(mysqli $conn, string $codiceOriginale, array $data): void
{
    $conn->begin_transaction();

    try {
        $insert = $conn->prepare("
            INSERT INTO SIMAttiva
                (codice, tipoSIM, associataA, dataAttivazione)
            VALUES
                (?, ?, ?, ?)
        ");

        if (!$insert) {
            throw new RuntimeException($conn->error);
        }

        $insert->bind_param(
            "ssss",
            $data["codice"],
            $data["tipoSIM"],
            $data["eraAssociataA"],
            $data["dataAttivazione"]
        );

        if (!$insert->execute()) {
            throw new RuntimeException($insert->error);
        }

        $insert->close();
        $affectedRows = deleteSimDisattivaByCode($conn, $codiceOriginale);

        if ($affectedRows === 0) {
            throw new RuntimeException("SIM disattiva non trovata durante la riattivazione.");
        }

        $conn->commit();
    } catch (Throwable $exception) {
        $conn->rollback();
        throw $exception;
    }
}
