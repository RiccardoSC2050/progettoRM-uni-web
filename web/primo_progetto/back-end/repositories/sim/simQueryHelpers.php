<?php

function bindSimParams(mysqli_stmt $stmt, string $types, array $params): void
{
    if ($types !== "") {
        $stmt->bind_param($types, ...$params);
    }
}

function buildSimUnionSql(): string
{
    return "
        SELECT
            codice,
            tipoSIM,
            associataA AS contratto,
            dataAttivazione,
            NULL AS dataDisattivazione,
            'attiva' AS stato
        FROM simattiva
        UNION ALL
        SELECT
            codice,
            tipoSIM,
            eraAssociataA AS contratto,
            dataAttivazione,
            dataDisattivazione,
            'disattiva' AS stato
        FROM simdisattiva
        UNION ALL
        SELECT
            codice,
            tipoSIM,
            NULL AS contratto,
            NULL AS dataAttivazione,
            NULL AS dataDisattivazione,
            'non_attiva' AS stato
        FROM simnonattiva
    ";
}

function buildSimFilters(array $filters): array
{
    $q = $filters["q"] ?? "";
    $tipo = $filters["tipoSIM"] ?? "";
    $stato = $filters["stato"] ?? "";
    $dataDisattivazione = $filters["dataDisattivazione"] ?? "";
    $where = [];
    $params = [];
    $types = "";

    if ($q !== "") {
        $where[] = "(sim.codice LIKE ? OR sim.contratto LIKE ?)";
        $params[] = "%" . $q . "%";
        $params[] = "%" . $q . "%";
        $types .= "ss";
    }

    if (in_array($tipo, ["standard", "microSIM", "nanoSIM", "eSIM"], true)) {
        $where[] = "sim.tipoSIM = ?";
        $params[] = $tipo;
        $types .= "s";
    }

    if (in_array($stato, ["attiva", "disattiva", "non_attiva"], true)) {
        $where[] = "sim.stato = ?";
        $params[] = $stato;
        $types .= "s";
    }

    if ($dataDisattivazione !== "") {
        $where[] = "sim.dataDisattivazione = ?";
        $params[] = $dataDisattivazione;
        $types .= "s";
    }

    return [
        "sql" => count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "",
        "params" => $params,
        "types" => $types
    ];
}
