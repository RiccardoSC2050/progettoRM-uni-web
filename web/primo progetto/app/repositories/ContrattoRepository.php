<?php

require_once __DIR__ . '/../includes/db.php';

class ContrattoRepository
{
    public function __construct(private ?PDO $pdo = null)
    {
        $this->pdo ??= getDbConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query('SELECT * FROM contratto ORDER BY id DESC')->fetchAll();
    }

    public function findById(int $id): array|false
    {
        $statement = $this->pdo->prepare('SELECT * FROM contratto WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->fetch();
    }
}
