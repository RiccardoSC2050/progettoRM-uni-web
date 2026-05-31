<?php

require_once __DIR__ . "/../core/response.php";

mysqli_report(MYSQLI_REPORT_OFF);

$config = [
    "host" => "localhost",
    "user" => "root",
    "password" => "",
    "database" => "my_progettorkmk"
];

$localConfigPath = __DIR__ . "/database.local.php";

if (is_file($localConfigPath)) {
    $localConfig = require $localConfigPath;

    if (is_array($localConfig)) {
        $config = array_merge($config, $localConfig);
    }
}

$conn = @new mysqli(
    $config["host"],
    $config["user"],
    $config["password"],
    $config["database"]
);

if ($conn->connect_error) {
    error_log("Database connection error: " . $conn->connect_error);
    sendError("Errore connessione database.", 500);
}

if (!$conn->set_charset("utf8mb4")) {
    error_log("Database charset error: " . $conn->error);
    sendError("Errore configurazione database.", 500);
}
