<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../core/validation.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/contractsService.php";

requireMethod("GET");

$pagination = getPagination(5, 30);
$filters = [
    "q" => getQueryString("q"),
    "tipo" => getQueryEnum("tipo", ["ricarica", "consumo"]),
    "data" => getQueryDate("data"),
    "sort" => getQueryEnum("sort", ["numero", "dataAttivazione", "telefonate"], "dataAttivazione"),
    "direction" => getQueryEnum("direction", ["asc", "desc"], "desc"),
    "limit" => $pagination["limit"],
    "offset" => $pagination["offset"]
];

try {
    sendSuccess(getContractsData($conn, $filters));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
