<?php

function isValidSimDate(string $value): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }

    $parts = explode("-", $value);
    return checkdate((int) $parts[1], (int) $parts[2], (int) $parts[0]);
}

function normalizeSimInput(array $input): array
{
    $stato = trim($input["statoFinale"] ?? "disattiva");

    return [
        "codice" => trim($input["codice"] ?? ""),
        "tipoSIM" => trim($input["tipoSIM"] ?? ""),
        "eraAssociataA" => trim($input["eraAssociataA"] ?? ""),
        "dataAttivazione" => trim($input["dataAttivazione"] ?? ""),
        "dataDisattivazione" => trim($input["dataDisattivazione"] ?? ""),
        "statoFinale" => $stato === "attiva" ? "attiva" : "disattiva"
    ];
}

function validateSimData(array $data, bool $allowActiveStatus = false): array
{
    $errors = [];
    $allowedTypes = ["standard", "microSIM", "nanoSIM", "eSIM"];

    if (!preg_match('/^[A-Za-z0-9_-]{3,30}$/', $data["codice"])) {
        $errors[] = "Codice SIM non valido: usa 3-30 caratteri, solo lettere, numeri, trattino o underscore. Esempio: SIM260001.";
    }

    if (!in_array($data["tipoSIM"], $allowedTypes, true)) {
        $errors[] = "Tipo SIM non valido: scegli standard, microSIM, nanoSIM oppure eSIM.";
    }

    if (!preg_match('/^\+?[0-9]{8,16}$/', $data["eraAssociataA"])) {
        $errors[] = "Contratto non valido: usa solo cifre con eventuale + iniziale. Esempio: +39320000000.";
    }

    if (!isValidSimDate($data["dataAttivazione"])) {
        $errors[] = "Data di attivazione non valida.";
    }

    if ($data["statoFinale"] === "attiva" && !$allowActiveStatus) {
        $errors[] = "La creazione diretta di una SIM attiva non è disponibile da questa sezione: qui si crea una SIM disattivata.";
    }

    if ($data["statoFinale"] !== "attiva") {
        if (!isValidSimDate($data["dataDisattivazione"])) {
            $errors[] = "Data di disattivazione non valida.";
        }

        if (
            isValidSimDate($data["dataAttivazione"]) &&
            isValidSimDate($data["dataDisattivazione"]) &&
            $data["dataDisattivazione"] < $data["dataAttivazione"]
        ) {
            $errors[] = "La data di disattivazione non può precedere la data di attivazione.";
        }
    }

    return $errors;
}
