<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../core/validation.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/contractsService.php";

requireMethod("GET");

$numero = getQueryString("numero");

if ($numero === "") {
    sendError("Numero contratto mancante.", 400);
}

try {
    $contract = getContractDetailData($conn, $numero);

    if (!$contract) {
        sendError("Contratto non trovato.", 404);
    }

    sendSuccess($contract);
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
