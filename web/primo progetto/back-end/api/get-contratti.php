<?php

header("Content-Type: application/json");

require_once "db.php";

try {

    $sql = "SELECT * FROM ContrattoTelefonico";

    $stmt = $conn->prepare($sql);

    $stmt->execute();

    $contratti = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($contratti);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "errore" => $e->getMessage()
    ]);
}