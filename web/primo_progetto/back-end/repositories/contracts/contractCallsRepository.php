<?php

function buildContractCallsFilters(array $filters): array
{
    $where = ["effettuataDa = ?"];
    $params = [$filters["numero"] ?? ""];
    $types = "s";

    if (($filters["id"] ?? "") !== "") {
        $where[] = "CAST(id AS CHAR) LIKE ?";
        $params[] = "%" . $filters["id"] . "%";
        $types .= "s";
    }

    if (($filters["data"] ?? "") !== "") {
        $where[] = "data = ?";
        $params[] = $filters["data"];
        $types .= "s";
    }

    if (($filters["minDurata"] ?? null) !== null) {
        $where[] = "durata >= ?";
        $params[] = $filters["minDurata"];
        $types .= "i";
    }

    if (($filters["maxCosto"] ?? null) !== null) {
        $where[] = "costo <= ?";
        $params[] = $filters["maxCosto"];
        $types .= "d";
    }

    return [
        "whereSql" => "WHERE " . implode(" AND ", $where),
        "params" => $params,
        "types" => $types
    ];
}

function mapContractCallRow(array $row): array
{
    return [
        "id" => (int) $row["id"],
        "data" => $row["data"],
        "ora" => $row["ora"],
        "durata" => (int) $row["durata"],
        "costo" => (float) $row["costo"]
    ];
}

function fetchContractCalls(mysqli $conn, array $filters): array
{
    $limit = $filters["limit"] ?? 5;
    $offset = $filters["offset"] ?? 0;
    $filterData = buildContractCallsFilters($filters);
    $whereSql = $filterData["whereSql"];
    $params = $filterData["params"];
    $types = $filterData["types"];

    $countRow = dbFetchOne(
        $conn,
        "SELECT COUNT(*) AS totale FROM telefonata $whereSql",
        $types,
        $params
    );

    $rows = dbFetchAll(
        $conn,
        "
            SELECT id, data, ora, durata, costo
            FROM telefonata
            $whereSql
            ORDER BY data DESC, ora DESC, id DESC
            LIMIT ? OFFSET ?
        ",
        $types . "ii",
        array_merge($params, [$limit, $offset])
    );

    return array_merge(dbPageMeta((int) $countRow["totale"], $limit, $offset), [
        "telefonate" => array_map("mapContractCallRow", $rows)
    ]);
}
