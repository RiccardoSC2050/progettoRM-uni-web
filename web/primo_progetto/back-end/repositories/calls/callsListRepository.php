<?php

function buildCallsFilters(array $filters): array
{
    $where = [];
    $params = [];
    $types = "";

    if (($filters["q"] ?? "") !== "") {
        $where[] = "(CAST(t.id AS CHAR) LIKE ? OR t.effettuataDa LIKE ?)";
        $like = "%" . $filters["q"] . "%";
        $params[] = $like;
        $params[] = $like;
        $types .= "ss";
    }

    if (($filters["data"] ?? "") !== "") {
        $where[] = "t.data = ?";
        $params[] = $filters["data"];
        $types .= "s";
    }

    if (($filters["costoMin"] ?? null) !== null) {
        $where[] = "t.costo >= ?";
        $params[] = $filters["costoMin"];
        $types .= "d";
    }

    if (($filters["costoMax"] ?? null) !== null) {
        $where[] = "t.costo <= ?";
        $params[] = $filters["costoMax"];
        $types .= "d";
    }

    if (($filters["durataMin"] ?? null) !== null) {
        $where[] = "t.durata >= ?";
        $params[] = $filters["durataMin"];
        $types .= "i";
    }

    return [
        "whereSql" => count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "",
        "params" => $params,
        "types" => $types
    ];
}

function mapCallRow(array $row): array
{
    return [
        "id" => (int) $row["id"],
        "effettuataDa" => $row["effettuataDa"],
        "data" => $row["data"],
        "ora" => $row["ora"],
        "durata" => (int) $row["durata"],
        "costo" => (float) $row["costo"],
        "tipoContratto" => $row["tipoContratto"]
    ];
}

function fetchCalls(mysqli $conn, array $filters): array
{
    $limit = $filters["limit"] ?? 15;
    $offset = $filters["offset"] ?? 0;
    $filterData = buildCallsFilters($filters);
    $whereSql = $filterData["whereSql"];
    $params = $filterData["params"];
    $types = $filterData["types"];

    $countRow = dbFetchOne(
        $conn,
        "
            SELECT
                COUNT(*) AS totale,
                COALESCE(SUM(t.costo), 0) AS entrateTotali
            FROM telefonata t
            $whereSql
        ",
        $types,
        $params
    );

    $rows = dbFetchAll(
        $conn,
        "
            SELECT
                t.id,
                t.effettuataDa,
                t.data,
                t.ora,
                t.durata,
                t.costo,
                ct.tipo AS tipoContratto
            FROM telefonata t
            LEFT JOIN contrattotelefonico ct ON ct.numero = t.effettuataDa
            $whereSql
            ORDER BY t.data DESC, t.ora DESC, t.id DESC
            LIMIT ? OFFSET ?
        ",
        $types . "ii",
        array_merge($params, [$limit, $offset])
    );

    return array_merge(dbPageMeta((int) $countRow["totale"], $limit, $offset), [
        "summary" => [
            "entrateTotali" => (float) $countRow["entrateTotali"]
        ],
        "telefonate" => array_map("mapCallRow", $rows)
    ]);
}
