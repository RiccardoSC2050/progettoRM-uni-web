<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/migration/migrationExportService.php";

requireMethod("GET");

try {
    sendSuccess(
        migrationBuildManifest($conn),
        "Manifest di esportazione generato."
    );
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
