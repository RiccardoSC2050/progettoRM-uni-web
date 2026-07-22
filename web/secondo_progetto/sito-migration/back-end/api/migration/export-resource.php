<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/migration/migrationExportService.php";

requireMethod("GET");

$resource = trim((string) ($_GET["resource"] ?? ""));
$limit = $_GET["limit"] ?? null;
$offset = $_GET["offset"] ?? null;

if ($resource === "") {
    sendError("Il parametro resource è obbligatorio.", 400);
}

try {
    sendSuccess(
        migrationBuildExportPage($conn, $resource, $limit, $offset),
        "Pagina di dati esportata."
    );
} catch (InvalidArgumentException $exception) {
    sendError($exception->getMessage(), 400);
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
