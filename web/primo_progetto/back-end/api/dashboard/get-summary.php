<?php

require_once "../../core/response.php";
require_once "../../core/request.php";
require_once "../../config/database.php";
require_once "../../services/dashboardService.php";

requireMethod("GET");

try {
    sendSuccess(getDashboardSummaryData($conn));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
