<?php

require_once "../../core/response.php";
require_once "../../core/request.php";
require_once "../../core/validation.php";
require_once "../../config/database.php";
require_once "../../services/callsService.php";

requireMethod("GET");

$year = filter_input(INPUT_GET, "year", FILTER_VALIDATE_INT);
$mode = getQueryEnum("mode", ["full", "chart"], "full");

try {
    sendSuccess(getCallsSummaryData($conn, $year ?: null, $mode));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
