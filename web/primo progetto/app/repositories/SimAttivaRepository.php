<?php

require_once __DIR__ . '/../includes/db.php';

class SimAttivaRepository
{
    public function __construct(private ?PDO $pdo = null)
    {
        $this->pdo ??= getDbConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query("SELECT * FROM sim WHERE stato = 'ATTIVA' ORDER BY numero")->fetchAll();
    }
}
