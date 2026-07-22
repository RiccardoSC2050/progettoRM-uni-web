<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/simService.php";

requireMethod("POST");

try {
    sendSuccess([], createSimData($conn, readJsonBody()));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
