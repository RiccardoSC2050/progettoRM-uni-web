<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";
require_once "sim-utils.php";

$input = readJsonBody();
$codice = trim($input["codice"] ?? "");

if ($codice === "") {
    sendJson(["success" => false, "message" => "Codice SIM mancante."], 422);
}

$stmt = $conn->prepare("DELETE FROM SIMDisattiva WHERE codice = ?");

if (!$stmt) {
    sendJson(["success" => false, "message" => $conn->error], 500);
}

$stmt->bind_param("s", $codice);

if (!$stmt->execute()) {
    sendJson(["success" => false, "message" => $stmt->error], 500);
}

$stmt->close();

sendJson(["success" => true, "message" => "SIM disattiva eliminata correttamente."]);
