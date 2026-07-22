<?php

require_once __DIR__ . "/../../repositories/migration/migrationExportRepository.php";

const MIGRATION_SCHEMA_VERSION = 1;
const MIGRATION_DEFAULT_PAGE_SIZE = 1000;
const MIGRATION_MAX_PAGE_SIZE = 5000;

function migrationAvailableResources(): array
{
    return array_keys(migrationResourceDefinitions());
}

function migrationBuildManifest(mysqli $conn): array
{
    $counts = [];

    foreach (migrationAvailableResources() as $resource) {
        $counts[$resource] = migrationCountRows($conn, $resource);
    }

    return [
        "schemaVersion" => MIGRATION_SCHEMA_VERSION,
        "generatedAt" => gmdate("c"),
        "format" => "application/json",
        "resources" => $counts,
        "recommendedPageSize" => MIGRATION_DEFAULT_PAGE_SIZE,
        "maxPageSize" => MIGRATION_MAX_PAGE_SIZE
    ];
}

function migrationNormalizePageSize($value): int
{
    if ($value === null || $value === "") {
        return MIGRATION_DEFAULT_PAGE_SIZE;
    }

    $limit = filter_var($value, FILTER_VALIDATE_INT);

    if ($limit === false || $limit < 1 || $limit > MIGRATION_MAX_PAGE_SIZE) {
        throw new InvalidArgumentException(
            "Il parametro limit deve essere compreso tra 1 e "
            . MIGRATION_MAX_PAGE_SIZE . "."
        );
    }

    return $limit;
}

function migrationNormalizeOffset($value): int
{
    if ($value === null || $value === "") {
        return 0;
    }

    $offset = filter_var($value, FILTER_VALIDATE_INT);

    if ($offset === false || $offset < 0) {
        throw new InvalidArgumentException(
            "Il parametro offset deve essere un intero maggiore o uguale a zero."
        );
    }

    return $offset;
}

function migrationBuildExportPage(
    mysqli $conn,
    string $resource,
    $limitValue,
    $offsetValue
): array {
    if (migrationGetResourceDefinition($resource) === null) {
        throw new InvalidArgumentException(
            "Risorsa non valida. Valori ammessi: "
            . implode(", ", migrationAvailableResources()) . "."
        );
    }

    $limit = migrationNormalizePageSize($limitValue);
    $offset = migrationNormalizeOffset($offsetValue);
    $total = migrationCountRows($conn, $resource);
    $rows = migrationFetchRows($conn, $resource, $limit, $offset);
    $nextOffset = $offset + count($rows);

    return [
        "schemaVersion" => MIGRATION_SCHEMA_VERSION,
        "generatedAt" => gmdate("c"),
        "resource" => $resource,
        "items" => $rows,
        "page" => [
            "total" => $total,
            "limit" => $limit,
            "offset" => $offset,
            "returned" => count($rows),
            "hasNext" => $nextOffset < $total,
            "nextOffset" => $nextOffset < $total ? $nextOffset : null
        ]
    ];
}
