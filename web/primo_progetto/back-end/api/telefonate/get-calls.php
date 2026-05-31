<?php

require_once "../../core/response.php";
require_once "../../core/request.php";
require_once "../../core/validation.php";
require_once "../../config/database.php";
require_once "../../services/callsService.php";

requireMethod("GET");

$pagination = getPagination(15, 30);
$filters = [
    "q" => getQueryString("q"),
    "data" => getQueryDate("data"),
    "costoMin" => getQueryFloat("costoMin"),
    "costoMax" => getQueryFloat("costoMax"),
    "durataMin" => getQueryIntOrNull("durataMin"),
    "limit" => $pagination["limit"],
    "offset" => $pagination["offset"]
];

try {
    sendSuccess(getCallsData($conn, $filters));
} catch (Throwable $exception) {
    sendServerError($exception->getMessage());
}
