<?php

require_once __DIR__ . '/includes/db.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $pdo = getDbConnection();
    echo "Connessione al database riuscita.\n";
    echo 'Driver: ' . $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) . "\n";
} catch (Throwable $exception) {
    http_response_code(500);
    echo "Connessione fallita.\n";
    echo $exception->getMessage() . "\n";
}
