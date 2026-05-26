<?php
$host = "localhost";
$user = "root";
$password = "@Riccardo2050";
$database = "my_progettorkmk";


$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Errore connessione database"
    ]);
    exit;
}

$conn->set_charset("utf8mb4");