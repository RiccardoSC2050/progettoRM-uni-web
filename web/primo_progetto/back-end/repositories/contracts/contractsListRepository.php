<?php

function buildContractFilters(array $filters): array
{
    $q = $filters["q"] ?? "";
    $tipo = $filters["tipo"] ?? "";
    $data = $filters["data"] ?? "";
    $availableForSim = !empty($filters["availableForSim"]);
    $where = [];
    $params = [];
    $types = "";

    if ($q !== "") {
        $where[] = "ct.numero LIKE ?";
        $params[] = "%" . $q . "%";
        $types .= "s";
    }

    if ($tipo === "ricarica" || $tipo === "consumo") {
        $where[] = "ct.tipo = ?";
        $params[] = $tipo;
        $types .= "s";
    }

    if ($data !== "") {
        $where[] = "ct.dataAttivazione = ?";
        $params[] = $data;
        $types .= "s";
    }

    if ($availableForSim) {
        $where[] = "sa.codice IS NULL";
    }

    return [
        "whereSql" => count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "",
        "params" => $params,
        "types" => $types
    ];
}

function mapContractRow(array $row): array
{
    return [
        "numero" => $row["numero"],
        "dataAttivazione" => $row["dataAttivazione"],
        "tipo" => $row["tipo"],
        "minutiResidui" => $row["minutiResidui"] !== null ? (int) $row["minutiResidui"] : null,
        "creditoResiduo" => $row["creditoResiduo"] !== null ? (float) $row["creditoResiduo"] : null,
        "codiceSIM" => $row["codiceSIM"],
        "tipoSIM" => $row["tipoSIM"],
        "numeroTelefonate" => (int) $row["numeroTelefonate"],
        "durataTotale" => (int) $row["durataTotale"]
    ];
}

function fetchContracts(mysqli $conn, array $filters): array
{
    $sort = $filters["sort"] ?? "dataAttivazione";
    $direction = $filters["direction"] ?? "desc";
    $limit = $filters["limit"] ?? 5;
    $offset = $filters["offset"] ?? 0;
    $filterData = buildContractFilters($filters);
    $whereSql = $filterData["whereSql"];
    $params = $filterData["params"];
    $types = $filterData["types"];
    $directionSql = $direction === "asc" ? "ASC" : "DESC";
    $sortMap = [
        "numero" => "ct.numero",
        "dataAttivazione" => "ct.dataAttivazione",
        "telefonate" => "numeroTelefonate"
    ];
    $orderColumn = $sortMap[$sort] ?? $sortMap["dataAttivazione"];

    $countRow = dbFetchOne(
        $conn,
        empty($filters["availableForSim"])
            ? "SELECT COUNT(*) AS totale FROM contrattotelefonico ct $whereSql"
            : "SELECT COUNT(*) AS totale FROM contrattotelefonico ct LEFT JOIN simattiva sa ON sa.associataA = ct.numero $whereSql",
        $types,
        $params
    );
    $summaryRow = dbFetchOne(
        $conn,
        "
            SELECT
                COUNT(*) AS totale,
                SUM(CASE WHEN ct.tipo = 'ricarica' THEN 1 ELSE 0 END) AS ricarica,
                SUM(CASE WHEN ct.tipo = 'consumo' THEN 1 ELSE 0 END) AS consumo,
                SUM(CASE WHEN sa.codice IS NULL THEN 1 ELSE 0 END) AS senzaSIM
            FROM contrattotelefonico ct
            LEFT JOIN simattiva sa ON sa.associataA = ct.numero
            $whereSql
        ",
        $types,
        $params
    );

    $listParams = array_merge($params, [$limit, $offset]);
    $rows = dbFetchAll(
        $conn,
        "
            SELECT
                ct.numero,
                ct.dataAttivazione,
                ct.tipo,
                ct.minutiResidui,
                ct.creditoResiduo,
                sa.codice AS codiceSIM,
                sa.tipoSIM,
                COALESCE(tel.numeroTelefonate, 0) AS numeroTelefonate,
                COALESCE(tel.durataTotale, 0) AS durataTotale
            FROM contrattotelefonico ct
            LEFT JOIN simattiva sa ON sa.associataA = ct.numero
            LEFT JOIN (
                SELECT
                    effettuataDa,
                    COUNT(*) AS numeroTelefonate,
                    SUM(durata) AS durataTotale
                FROM telefonata
                GROUP BY effettuataDa
            ) tel ON tel.effettuataDa = ct.numero
            $whereSql
            ORDER BY $orderColumn $directionSql, ct.numero ASC
            LIMIT ? OFFSET ?
        ",
        $types . "ii",
        $listParams
    );

    return array_merge(dbPageMeta((int) $countRow["totale"], $limit, $offset), [
        "summary" => [
            "totale" => (int) ($summaryRow["totale"] ?? 0),
            "ricarica" => (int) ($summaryRow["ricarica"] ?? 0),
            "consumo" => (int) ($summaryRow["consumo"] ?? 0),
            "senzaSIM" => (int) ($summaryRow["senzaSIM"] ?? 0)
        ],
        "contratti" => array_map("mapContractRow", $rows)
    ]);
}
