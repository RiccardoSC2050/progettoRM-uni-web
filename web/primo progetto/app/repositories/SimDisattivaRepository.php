<?php

require_once __DIR__ . '/../includes/db.php';

class SimDisattivaRepository
{
    public function __construct(private ?PDO $pdo = null)
    {
        $this->pdo ??= getDbConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query("SELECT * FROM sim WHERE stato = 'DISATTIVA' ORDER BY numero")->fetchAll();
    }

    public function findById(int $id): array|false
    {
        $statement = $this->pdo->prepare('SELECT * FROM sim WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->fetch();
    }

    public function create(array $data): bool
    {
        $statement = $this->pdo->prepare(
            "INSERT INTO sim (numero, stato, intestatario) VALUES (:numero, 'DISATTIVA', :intestatario)"
        );

        return $statement->execute([
            'numero' => $data['numero'] ?? null,
            'intestatario' => $data['intestatario'] ?? null,
        ]);
    }

    public function update(int $id, array $data): bool
    {
        $statement = $this->pdo->prepare(
            'UPDATE sim SET numero = :numero, intestatario = :intestatario WHERE id = :id'
        );

        return $statement->execute([
            'id' => $id,
            'numero' => $data['numero'] ?? null,
            'intestatario' => $data['intestatario'] ?? null,
        ]);
    }

    public function delete(int $id): bool
    {
        $statement = $this->pdo->prepare('DELETE FROM sim WHERE id = :id');
        return $statement->execute(['id' => $id]);
    }
}
