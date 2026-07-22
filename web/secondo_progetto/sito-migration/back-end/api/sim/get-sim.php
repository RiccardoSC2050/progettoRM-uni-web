<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";
require_once __DIR__ . "/../../core/validation.php";
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../../services/simService.php";

requireMethod("GET");

$pagination = getPagination(5, 15);
$filters = [
    "q" => getQueryString("q"),
    "tipoSIM" => getQueryEnum("tipoSIM", ["standard", "microSIM", "nanoSIM", "eSIM"]),
    "stato" => getQueryEnum("stato", ["attiva", "disattiva", "non_attiva"]),
    "dataDisattivazione" => getQueryDate("dataDisattivazione"),
    "limit" => $pagination["limit"],
    "offset" => $pagination["offset"]
];

try {
    sendSuccess(getSimData($conn, $filters));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
