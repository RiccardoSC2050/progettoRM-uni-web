<?php
require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../config/database.php";

requireMethod("GET");

try {
    $result = $conn->query("SELECT 1 AS ok");
    $row = $result ? $result->fetch_assoc() : null;
    sendSuccess([
        "service" => "migration-export-api",
        "version" => 1,
        "database" => ((int) ($row["ok"] ?? 0)) === 1 ? "reachable" : "unavailable",
        "generatedAt" => gmdate("c")
    ]);
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
