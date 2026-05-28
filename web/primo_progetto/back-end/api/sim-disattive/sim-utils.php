<?php

function readJsonBody(): array
{
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    return is_array($data) ? $data : $_POST;
}

function sendJson(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function isValidDateValue(string $value): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }

    $parts = explode("-", $value);
    return checkdate((int) $parts[1], (int) $parts[2], (int) $parts[0]);
}

function normalizeSimInput(array $input): array
{
    return [
        "codice" => trim($input["codice"] ?? ""),
        "tipoSIM" => trim($input["tipoSIM"] ?? ""),
        "eraAssociataA" => trim($input["eraAssociataA"] ?? ""),
        "dataAttivazione" => trim($input["dataAttivazione"] ?? ""),
        "dataDisattivazione" => trim($input["dataDisattivazione"] ?? "")
    ];
}

function validateSimData(array $data): array
{
    $errors = [];
    $allowedTypes = ["standard", "microSIM", "nanoSIM", "eSIM"];

    if ($data["codice"] === "") {
        $errors[] = "Il codice SIM è obbligatorio.";
    }

    if (!in_array($data["tipoSIM"], $allowedTypes, true)) {
        $errors[] = "Il tipo SIM non è valido.";
    }

    if ($data["eraAssociataA"] === "") {
        $errors[] = "Il contratto precedente è obbligatorio.";
    }

    if (!isValidDateValue($data["dataAttivazione"])) {
        $errors[] = "La data di attivazione non è valida.";
    }

    if (!isValidDateValue($data["dataDisattivazione"])) {
        $errors[] = "La data di disattivazione non è valida.";
    }

    if (
        isValidDateValue($data["dataAttivazione"]) &&
        isValidDateValue($data["dataDisattivazione"]) &&
        $data["dataDisattivazione"] < $data["dataAttivazione"]
    ) {
        $errors[] = "La disattivazione non può precedere l'attivazione.";
    }

    return $errors;
}

function contractExists(mysqli $conn, string $numero): bool
{
    $stmt = $conn->prepare("SELECT numero FROM ContrattoTelefonico WHERE numero = ? LIMIT 1");
    $stmt->bind_param("s", $numero);
    $stmt->execute();
    $exists = $stmt->get_result()->num_rows > 0;
    $stmt->close();

    return $exists;
}

function simCodeExists(mysqli $conn, string $codice, string $excludeCode = ""): bool
{
    $queries = [
        "SELECT codice FROM SIMAttiva WHERE codice = ? LIMIT 1",
        "SELECT codice FROM SIMNonAttiva WHERE codice = ? LIMIT 1",
        $excludeCode !== ""
            ? "SELECT codice FROM SIMDisattiva WHERE codice = ? AND codice <> ? LIMIT 1"
            : "SELECT codice FROM SIMDisattiva WHERE codice = ? LIMIT 1"
    ];

    foreach ($queries as $sql) {
        $stmt = $conn->prepare($sql);

        if ($excludeCode !== "" && strpos($sql, "codice <> ?") !== false) {
            $stmt->bind_param("ss", $codice, $excludeCode);
        } else {
            $stmt->bind_param("s", $codice);
        }

        $stmt->execute();
        $exists = $stmt->get_result()->num_rows > 0;
        $stmt->close();

        if ($exists) {
            return true;
        }
    }

    return false;
}
