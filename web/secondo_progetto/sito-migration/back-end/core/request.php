<?php

require_once __DIR__ . "/response.php";

function requireMethod(string $method): void
{
    $expected = strtoupper($method);
    $actual = strtoupper($_SERVER["REQUEST_METHOD"] ?? "GET");

    if ($actual !== $expected) {
        header("Allow: " . $expected);
        sendError("Metodo HTTP non consentito.", 405);
    }
}

function readJsonBody(): array
{
    $raw = file_get_contents("php://input");

    if ($raw === false || trim($raw) === "") {
        return is_array($_POST) ? $_POST : [];
    }

    $data = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError("Richiesta JSON non valida.", 400);
    }

    if (!is_array($data)) {
        sendError("Formato richiesta non valido.", 400);
    }

    return $data;
}
