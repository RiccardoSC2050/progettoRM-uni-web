<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=utf-8");

try {
    require_once __DIR__ . "/../../core/response.php";
    require_once __DIR__ . "/../../core/request.php";
    require_once __DIR__ . "/../../config/database.php";
    require_once __DIR__ . "/../../services/dashboardService.php";

    requireMethod("GET");

    if (!isset($conn)) {
        throw new Exception('Variabile $conn non definita. Controlla il file /back-end/config/database.php');
    }

    $data = getDashboardSummaryData($conn);

    echo json_encode([
        "success" => true,
        "data" => $data
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Throwable $exception) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Errore reale intercettato",
        "errore" => $exception->getMessage(),
        "file" => $exception->getFile(),
        "linea" => $exception->getLine()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}