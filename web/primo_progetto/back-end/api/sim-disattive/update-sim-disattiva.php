<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";
require_once "sim-utils.php";

$input = readJsonBody();
$codiceOriginale = trim($input["codiceOriginale"] ?? $input["codice"] ?? "");
$data = normalizeSimInput($input);

if ($codiceOriginale === "") {
    sendJson(["success" => false, "message" => "Codice originale mancante."], 422);
}

$errors = validateSimData($data);

if (count($errors) > 0) {
    sendJson(["success" => false, "message" => implode(" ", $errors)], 422);
}

if (!contractExists($conn, $data["eraAssociataA"])) {
    sendJson(["success" => false, "message" => "Il contratto indicato non esiste."], 422);
}

if (simCodeExists($conn, $data["codice"], $codiceOriginale)) {
    sendJson(["success" => false, "message" => "Il codice SIM è già presente nel database."], 422);
}

$stmt = $conn->prepare("
    UPDATE SIMDisattiva
    SET codice = ?, tipoSIM = ?, eraAssociataA = ?, dataAttivazione = ?, dataDisattivazione = ?
    WHERE codice = ?
");

if (!$stmt) {
    sendJson(["success" => false, "message" => $conn->error], 500);
}

$stmt->bind_param(
    "ssssss",
    $data["codice"],
    $data["tipoSIM"],
    $data["eraAssociataA"],
    $data["dataAttivazione"],
    $data["dataDisattivazione"],
    $codiceOriginale
);

if (!$stmt->execute()) {
    sendJson(["success" => false, "message" => $stmt->error], 500);
}

if ($stmt->affected_rows < 0) {
    sendJson(["success" => false, "message" => "Aggiornamento non riuscito."], 500);
}

$stmt->close();

sendJson(["success" => true, "message" => "SIM disattiva aggiornata correttamente."]);
