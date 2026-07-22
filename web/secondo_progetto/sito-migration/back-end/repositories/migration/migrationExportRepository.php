<?php

require_once __DIR__ . "/../../core/db.php";

/**
 * Repository dedicato esclusivamente all'esportazione dei dati.
 * Le tabelle disponibili sono definite in una allow-list per evitare
 * che parametri HTTP possano diventare nomi di tabella arbitrari.
 */
function migrationResourceDefinitions(): array
{
    return [
        "contratti" => [
            "table" => "ContrattoTelefonico",
            "columns" => "numero, dataAttivazione, tipo, minutiResidui, creditoResiduo",
            "orderBy" => "numero"
        ],
        "simAttive" => [
            "table" => "SIMAttiva",
            "columns" => "codice, tipoSIM, associataA, dataAttivazione",
            "orderBy" => "codice"
        ],
        "simDisattive" => [
            "table" => "SIMDisattiva",
            "columns" => "codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione",
            "orderBy" => "codice"
        ],
        "simNonAttive" => [
            "table" => "SIMNonAttiva",
            "columns" => "codice, tipoSIM",
            "orderBy" => "codice"
        ],
        "telefonate" => [
            "table" => "Telefonata",
            "columns" => "id, effettuataDa, data, ora, durata, costo",
            "orderBy" => "effettuataDa, data, ora, id"
        ]
    ];
}

function migrationGetResourceDefinition(string $resource): ?array
{
    $definitions = migrationResourceDefinitions();

    return $definitions[$resource] ?? null;
}

function migrationCountRows(mysqli $conn, string $resource): int
{
    $definition = migrationGetResourceDefinition($resource);

    if ($definition === null) {
        throw new InvalidArgumentException("Risorsa di esportazione non valida.");
    }

    $row = dbQueryOne(
        $conn,
        "SELECT COUNT(*) AS totale FROM `" . $definition["table"] . "`"
    );

    return (int) ($row["totale"] ?? 0);
}

function migrationFetchRows(
    mysqli $conn,
    string $resource,
    int $limit,
    int $offset
): array {
    $definition = migrationGetResourceDefinition($resource);

    if ($definition === null) {
        throw new InvalidArgumentException("Risorsa di esportazione non valida.");
    }

    // limit e offset sono già convertiti e validati come interi dal service.
    $sql = "SELECT " . $definition["columns"]
        . " FROM `" . $definition["table"] . "`"
        . " ORDER BY " . $definition["orderBy"]
        . " LIMIT " . $limit
        . " OFFSET " . $offset;

    return dbQueryAll($conn, $sql);
}
