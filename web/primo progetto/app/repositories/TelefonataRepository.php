<?php

require_once __DIR__ . '/../includes/db.php';

class TelefonataRepository
{
    public function __construct(private ?PDO $pdo = null)
    {
        $this->pdo ??= getDbConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query('SELECT * FROM telefonata ORDER BY data_telefonata DESC')->fetchAll();
    }
}
