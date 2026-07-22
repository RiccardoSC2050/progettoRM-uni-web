<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../core/validation.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/callsService.php";

requireMethod("GET");

$year = filter_input(INPUT_GET, "year", FILTER_VALIDATE_INT);
$mode = getQueryEnum("mode", ["full", "chart"], "full");

try {
    sendSuccess(getCallsSummaryData($conn, $year ?: null, $mode));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
