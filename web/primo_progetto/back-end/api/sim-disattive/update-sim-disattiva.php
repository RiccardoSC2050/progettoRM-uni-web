<?php

require_once "../../core/response.php";
require_once "../../core/request.php";
require_once "../../config/database.php";
require_once "../../services/simDisattiveService.php";

requireMethod("POST");

try {
    sendSuccess([], updateSimDisattivaData($conn, readJsonBody()));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
