<?php

function contractExistsForSim(mysqli $conn, string $numero): bool
{
    $stmt = $conn->prepare("SELECT numero FROM contrattotelefonico WHERE numero = ? LIMIT 1");

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

function getContractActivationDateForSim(mysqli $conn, string $numero): ?string
{
    $stmt = $conn->prepare("SELECT dataAttivazione FROM contrattotelefonico WHERE numero = ? LIMIT 1");

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    $stmt->bind_param("s", $numero);

    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }

    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $row["dataAttivazione"] ?? null;
}

function activeContractHasSim(mysqli $conn, string $numero, string $excludeCode = ""): bool
{
    $sql = $excludeCode !== ""
        ? "SELECT codice FROM simattiva WHERE associataA = ? AND codice <> ? LIMIT 1"
        : "SELECT codice FROM simattiva WHERE associataA = ? LIMIT 1";
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
        $excludeCode !== ""
            ? ["SELECT codice FROM simattiva WHERE codice = ? AND codice <> ? LIMIT 1", "ss"]
            : ["SELECT codice FROM simattiva WHERE codice = ? LIMIT 1", "s"],
        $excludeCode !== ""
            ? ["SELECT codice FROM simdisattiva WHERE codice = ? AND codice <> ? LIMIT 1", "ss"]
            : ["SELECT codice FROM simdisattiva WHERE codice = ? LIMIT 1", "s"],
        $excludeCode !== ""
            ? ["SELECT codice FROM simnonattiva WHERE codice = ? AND codice <> ? LIMIT 1", "ss"]
            : ["SELECT codice FROM simnonattiva WHERE codice = ? LIMIT 1", "s"]
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
