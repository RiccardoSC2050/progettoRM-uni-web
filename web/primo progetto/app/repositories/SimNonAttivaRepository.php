<?php

require_once __DIR__ . '/../includes/db.php';

class SimNonAttivaRepository
{
    public function __construct(private ?PDO $pdo = null)
    {
        $this->pdo ??= getDbConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query("SELECT * FROM sim WHERE stato = 'NON_ATTIVA' ORDER BY numero")->fetchAll();
    }
}
