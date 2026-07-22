<?php

require_once __DIR__ . "/../services/databaseIntegrityService.php";

function runDatabaseIntegrityGuard(mysqli $conn): void
{
    runDatabaseIntegrityCheck($conn);
}
