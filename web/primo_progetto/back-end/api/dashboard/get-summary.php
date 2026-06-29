<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/dashboardService.php";

requireMethod("GET");

try {
    sendSuccess(getDashboardSummaryData($conn));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
