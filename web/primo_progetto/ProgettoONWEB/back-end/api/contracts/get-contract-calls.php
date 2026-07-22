<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../core/validation.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/contractsService.php";

requireMethod("GET");

$numero = getQueryString("numero");
$pagination = getPagination(5, 5);

if ($numero === "") {
    sendError("Numero contratto mancante.", 400);
}

$filters = [
    "numero" => $numero,
    "id" => getQueryString("id"),
    "data" => getQueryDate("data"),
    "minDurata" => getQueryIntOrNull("minDurata"),
    "maxCosto" => getQueryFloat("maxCosto"),
    "limit" => $pagination["limit"],
    "offset" => $pagination["offset"]
];

try {
    sendSuccess(getContractCallsData($conn, $filters));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
