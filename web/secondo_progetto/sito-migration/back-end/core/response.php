<?php

if (!headers_sent()) {
    header("Content-Type: application/json; charset=utf-8");
}

function sendJson(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function sendSuccess(array $data = [], string $message = ""): void
{
    $payload = ["success" => true, "data" => $data];

    if ($message !== "") {
        $payload["message"] = $message;
    }

    sendJson($payload);
}

function sendError(string $message, int $status = 400): void
{
    sendJson([
        "success" => false,
        "message" => $message
    ], $status);
}

function sendServerError(?string $detail = null): void
{
    if ($detail !== null && $detail !== "") {
        error_log($detail);
    }

    sendError("Errore interno del server.", 500);
}
