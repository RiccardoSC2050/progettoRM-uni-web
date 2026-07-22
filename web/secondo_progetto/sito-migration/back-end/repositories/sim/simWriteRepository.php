<?php

function deleteSimFromState(mysqli $conn, string $codice, string $stato): int
{
    $tables = [
        "attiva" => "`SIMAttiva`",
        "disattiva" => "`SIMDisattiva`",
        "non_attiva" => "`SIMNonAttiva`"
    ];

    if (!isset($tables[$stato])) {
        throw new RuntimeException("Stato SIM non valido.");
    }

    $stmt = $conn->prepare("DELETE FROM " . $tables[$stato] . " WHERE codice = ?");

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

function insertSimByState(mysqli $conn, array $data): void
{
    if ($data["statoFinale"] === "attiva") {
        $stmt = $conn->prepare("
            INSERT INTO `SIMAttiva` (codice, tipoSIM, associataA, dataAttivazione)
            VALUES (?, ?, ?, ?)
        ");

        if (!$stmt) {
            throw new RuntimeException($conn->error);
        }

        $stmt->bind_param("ssss", $data["codice"], $data["tipoSIM"], $data["contratto"], $data["dataAttivazione"]);
    } elseif ($data["statoFinale"] === "disattiva") {
        $stmt = $conn->prepare("
            INSERT INTO `SIMDisattiva` (codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione)
            VALUES (?, ?, ?, ?, ?)
        ");

        if (!$stmt) {
            throw new RuntimeException($conn->error);
        }

        $stmt->bind_param("sssss", $data["codice"], $data["tipoSIM"], $data["contratto"], $data["dataAttivazione"], $data["dataDisattivazione"]);
    } else {
        $stmt = $conn->prepare("
            INSERT INTO `SIMNonAttiva` (codice, tipoSIM)
            VALUES (?, ?)
        ");

        if (!$stmt) {
            throw new RuntimeException($conn->error);
        }

        $stmt->bind_param("ss", $data["codice"], $data["tipoSIM"]);
    }

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $stmt->close();
}

function replaceSimState(mysqli $conn, string $codiceOriginale, string $statoOriginale, array $data): void
{
    $conn->begin_transaction();

    try {
        $deletedRows = deleteSimFromState($conn, $codiceOriginale, $statoOriginale);

        if ($deletedRows === 0) {
            throw new RuntimeException("SIM non trovata durante l'aggiornamento.");
        }

        insertSimByState($conn, $data);
        $conn->commit();
    } catch (Throwable $exception) {
        $conn->rollback();
        throw $exception;
    }
}

function deleteSimDisattivaByCode(mysqli $conn, string $codice): int
{
    return deleteSimFromState($conn, $codice, "disattiva");
}