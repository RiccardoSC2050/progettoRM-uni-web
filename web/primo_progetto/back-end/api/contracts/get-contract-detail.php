<?php

header("Content-Type: application/json; charset=utf-8");

require_once "../../config/database.php";

$numero = trim($_GET["numero"] ?? "");

if ($numero === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Numero contratto mancante."]);
    exit;
}

$sql = "
    SELECT
        ct.numero,
        ct.dataAttivazione,
        ct.tipo,
        ct.minutiResidui,
        ct.creditoResiduo,
        sa.codice AS codiceSIM,
        sa.tipoSIM,
        sa.dataAttivazione AS dataAttivazioneSIM,
        COALESCE(tel.numeroTelefonate, 0) AS numeroTelefonate,
        COALESCE(tel.durataTotale, 0) AS durataTotale,
        COALESCE(tel.costoTotale, 0) AS costoTotale
    FROM ContrattoTelefonico ct
    LEFT JOIN SIMAttiva sa
        ON sa.associataA = ct.numero
    LEFT JOIN (
        SELECT
            effettuataDa,
            COUNT(*) AS numeroTelefonate,
            SUM(durata) AS durataTotale,
            SUM(costo) AS costoTotale
        FROM Telefonata
        GROUP BY effettuataDa
    ) tel
        ON tel.effettuataDa = ct.numero
    WHERE ct.numero = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $conn->error]);
    exit;
}

$stmt->bind_param("s", $numero);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Contratto non trovato."]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => [
        "numero" => $row["numero"],
        "dataAttivazione" => $row["dataAttivazione"],
        "tipo" => $row["tipo"],
        "minutiResidui" => $row["minutiResidui"] !== null ? (int) $row["minutiResidui"] : null,
        "creditoResiduo" => $row["creditoResiduo"] !== null ? (float) $row["creditoResiduo"] : null,
        "codiceSIM" => $row["codiceSIM"],
        "tipoSIM" => $row["tipoSIM"],
        "dataAttivazioneSIM" => $row["dataAttivazioneSIM"],
        "numeroTelefonate" => (int) $row["numeroTelefonate"],
        "durataTotale" => (int) $row["durataTotale"],
        "costoTotale" => (float) $row["costoTotale"]
    ]
]);
