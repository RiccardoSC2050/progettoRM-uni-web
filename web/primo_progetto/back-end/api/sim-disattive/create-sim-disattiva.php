<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";
require_once "sim-utils.php";

$data = normalizeSimInput(readJsonBody());
$errors = validateSimData($data);

if (count($errors) > 0) {
    sendJson(["success" => false, "message" => implode(" ", $errors)], 422);
}

if (!contractExists($conn, $data["eraAssociataA"])) {
    sendJson(["success" => false, "message" => "Il contratto indicato non esiste."], 422);
}

if (simCodeExists($conn, $data["codice"])) {
    sendJson(["success" => false, "message" => "Il codice SIM è già presente nel database."], 422);
}

$stmt = $conn->prepare("
    INSERT INTO SIMDisattiva
        (codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione)
    VALUES
        (?, ?, ?, ?, ?)
");

if (!$stmt) {
    sendJson(["success" => false, "message" => $conn->error], 500);
}

$stmt->bind_param(
    "sssss",
    $data["codice"],
    $data["tipoSIM"],
    $data["eraAssociataA"],
    $data["dataAttivazione"],
    $data["dataDisattivazione"]
);

if (!$stmt->execute()) {
    sendJson(["success" => false, "message" => $stmt->error], 500);
}

$stmt->close();

sendJson(["success" => true, "message" => "SIM disattiva creata correttamente."]);
