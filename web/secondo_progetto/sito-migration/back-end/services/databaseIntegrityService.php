<?php

function tableExistsForIntegrity(mysqli $conn, string $tableName): bool
{
    $stmt = $conn->prepare("SHOW TABLES LIKE ?");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $tableName);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $exists = $stmt->get_result()->num_rows > 0;
    $stmt->close();

    return $exists;
}

function indexExistsForIntegrity(mysqli $conn, string $tableName, string $indexName): bool
{
    $stmt = $conn->prepare("SHOW INDEX FROM `$tableName` WHERE Key_name = ?");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $indexName);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $exists = $stmt->get_result()->num_rows > 0;
    $stmt->close();

    return $exists;
}

function ensureIntegrityLogTable(mysqli $conn): void
{
    if (!$conn->query("CREATE TABLE IF NOT EXISTS database_integrity_log (
        id INT NOT NULL AUTO_INCREMENT,
        evento VARCHAR(80) NOT NULL,
        dettaglio TEXT NOT NULL,
        creatoIl DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_integrity_log_evento (evento),
        KEY idx_integrity_log_creato (creatoIl)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci")) {
        throw new RuntimeException($conn->error);
    }
}

function writeIntegrityLog(mysqli $conn, string $evento, string $dettaglio): void
{
    ensureIntegrityLogTable($conn);

    $stmt = $conn->prepare("INSERT INTO database_integrity_log (evento, dettaglio) VALUES (?, ?)");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("ss", $evento, $dettaglio);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $stmt->close();
}

function fetchDuplicatedActiveNumbers(mysqli $conn): array
{
    $result = $conn->query("SELECT associataA, COUNT(*) AS totale
        FROM simattiva
        GROUP BY associataA
        HAVING COUNT(*) > 1");

    if (!$result) {
        throw new RuntimeException($conn->error);
    }

    $numbers = [];

    while ($row = $result->fetch_assoc()) {
        $numbers[] = $row["associataA"];
    }

    $result->free();

    return $numbers;
}

function disableDuplicatedActiveNumber(mysqli $conn, string $numero): int
{
    $stmt = $conn->prepare("SELECT codice, tipoSIM, associataA, dataAttivazione FROM simattiva WHERE associataA = ?");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $numero);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $result = $stmt->get_result();
    $rows = [];

    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    $stmt->close();

    if (count($rows) < 2) {
        return 0;
    }

    $today = date("Y-m-d");
    $moved = 0;

    foreach ($rows as $row) {
        $insert = $conn->prepare("INSERT IGNORE INTO simdisattiva
            (codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione)
            VALUES (?, ?, ?, ?, ?)");

        if (!$insert) {
            throw new RuntimeException($conn->error);
        }

        $dataAttivazione = $row["dataAttivazione"];
        $dataDisattivazione = $today < $dataAttivazione ? $dataAttivazione : $today;
        $insert->bind_param("sssss", $row["codice"], $row["tipoSIM"], $row["associataA"], $dataAttivazione, $dataDisattivazione);

        if (!$insert->execute()) {
            throw new RuntimeException($insert->error);
        }

        $moved += $insert->affected_rows > 0 ? 1 : 0;
        $insert->close();
    }

    $delete = $conn->prepare("DELETE FROM simattiva WHERE associataA = ?");

    if (!$delete) {
        throw new RuntimeException($conn->error);
    }

    $delete->bind_param("s", $numero);

    if (!$delete->execute()) {
        throw new RuntimeException($delete->error);
    }

    $deleted = $delete->affected_rows;
    $delete->close();

    writeIntegrityLog(
        $conn,
        "SIM_ATTIVE_DUPLICATE_DISABILITATE",
        "Numero $numero trovato su $deleted SIM attive. Tutte le associazioni attive sono state spostate nello storico e il numero è stato liberato. Righe storiche nuove: $moved."
    );

    return $deleted;
}

function ensureSimActiveUniqueContractIndex(mysqli $conn): void
{
    if (!indexExistsForIntegrity($conn, "simattiva", "uq_sim_attiva_associata_a")) {
        if (!$conn->query("ALTER TABLE simattiva ADD UNIQUE KEY uq_sim_attiva_associata_a (associataA)")) {
            throw new RuntimeException($conn->error);
        }

        writeIntegrityLog($conn, "VINCOLO_UNICITA_ATTIVE_CREATO", "Creato vincolo UNIQUE su simattiva.associataA.");
    }
}

function runDatabaseIntegrityCheck(mysqli $conn): void
{
    static $alreadyRun = false;

    if ($alreadyRun) {
        return;
    }

    $alreadyRun = true;

    if (!tableExistsForIntegrity($conn, "simattiva") || !tableExistsForIntegrity($conn, "simdisattiva")) {
        return;
    }

    ensureIntegrityLogTable($conn);

    $conn->begin_transaction();

    try {
        foreach (fetchDuplicatedActiveNumbers($conn) as $numero) {
            disableDuplicatedActiveNumber($conn, $numero);
        }

        $conn->commit();
    } catch (Throwable $exception) {
        $conn->rollback();
        throw $exception;
    }

    ensureSimActiveUniqueContractIndex($conn);
}
