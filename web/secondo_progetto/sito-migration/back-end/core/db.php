<?php

function dbPrepare(mysqli $conn, string $sql): mysqli_stmt
{
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new RuntimeException($conn->error);
    }

    return $stmt;
}

function dbBind(mysqli_stmt $stmt, string $types, array $params): void
{
    if ($types !== "") {
        $stmt->bind_param($types, ...$params);
    }
}

function dbExecute(mysqli_stmt $stmt): void
{
    if (!$stmt->execute()) {
        throw new RuntimeException($stmt->error);
    }
}

function dbFetchOne(mysqli $conn, string $sql, string $types = "", array $params = []): ?array
{
    $stmt = dbPrepare($conn, $sql);
    dbBind($stmt, $types, $params);
    dbExecute($stmt);

    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $row ?: null;
}

function dbFetchAll(mysqli $conn, string $sql, string $types = "", array $params = []): array
{
    $stmt = dbPrepare($conn, $sql);
    dbBind($stmt, $types, $params);
    dbExecute($stmt);

    $result = $stmt->get_result();
    $rows = [];

    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    $stmt->close();

    return $rows;
}

function dbQueryOne(mysqli $conn, string $sql): ?array
{
    $result = $conn->query($sql);

    if (!$result) {
        throw new RuntimeException($conn->error);
    }

    $row = $result->fetch_assoc();

    return $row ?: null;
}

function dbQueryAll(mysqli $conn, string $sql): array
{
    $result = $conn->query($sql);

    if (!$result) {
        throw new RuntimeException($conn->error);
    }

    $rows = [];

    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    return $rows;
}

function dbPageMeta(int $totale, int $limit, int $offset): array
{
    return [
        "totale" => $totale,
        "limite" => $limit,
        "offset" => $offset,
        "hasNext" => $offset + $limit < $totale,
        "hasPrevious" => $offset - $limit >= 0
    ];
}
