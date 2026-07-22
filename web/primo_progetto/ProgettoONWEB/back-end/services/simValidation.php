<?php

function isValidSimDate(string $value): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }

    $parts = explode("-", $value);
    return checkdate((int) $parts[1], (int) $parts[2], (int) $parts[0]);
}

function getTodayForSim(): string
{
    return date("Y-m-d");
}

function normalizeSimInput(array $input): array
{
    $stato = trim($input["statoFinale"] ?? "non_attiva");
    $allowedStates = ["attiva", "disattiva", "non_attiva"];

    if (!in_array($stato, $allowedStates, true)) {
        $stato = "non_attiva";
    }

    return [
        "codiceOriginale" => trim($input["codiceOriginale"] ?? $input["codice"] ?? ""),
        "statoOriginale" => trim($input["statoOriginale"] ?? ""),
        "codice" => trim($input["codice"] ?? ""),
        "tipoSIM" => trim($input["tipoSIM"] ?? ""),
        "contratto" => trim($input["contratto"] ?? $input["eraAssociataA"] ?? ""),
        "dataAttivazione" => trim($input["dataAttivazione"] ?? ""),
        "dataDisattivazione" => trim($input["dataDisattivazione"] ?? ""),
        "statoFinale" => $stato
    ];
}

function validateSimBaseData(array $data): array
{
    $errors = [];
    $allowedTypes = ["standard", "microSIM", "nanoSIM", "eSIM"];

    if (!preg_match('/^[A-Za-z0-9_-]{3,30}$/', $data["codice"])) {
        $errors[] = "Codice SIM non valido: usa 3-30 caratteri, solo lettere, numeri, trattino o underscore. Esempio: SIM260001.";
    }

    if (!in_array($data["tipoSIM"], $allowedTypes, true)) {
        $errors[] = "Tipo SIM non valido: scegli standard, microSIM, nanoSIM oppure eSIM.";
    }

    return $errors;
}

function validateSimData(array $data): array
{
    $errors = validateSimBaseData($data);

    if ($data["statoFinale"] === "non_attiva") {
        return $errors;
    }

    if ($data["statoFinale"] === "attiva") {
        if (!preg_match('/^\+?[0-9]{8,16}$/', $data["contratto"])) {
            $errors[] = "Contratto non valido: usa solo cifre con eventuale + iniziale. Esempio: +39320000000.";
        }

        if ($data["dataAttivazione"] === "" || !isValidSimDate($data["dataAttivazione"])) {
            $errors[] = "Data di attivazione non valida.";
        }

        return $errors;
    }

    if ($data["statoFinale"] === "disattiva") {
        if (!preg_match('/^\+?[0-9]{8,16}$/', $data["contratto"])) {
            $errors[] = "Contratto storico non valido per la disattivazione.";
        }

        if ($data["dataAttivazione"] === "" || !isValidSimDate($data["dataAttivazione"])) {
            $errors[] = "Data di attivazione storica non valida.";
        }

        if ($data["dataDisattivazione"] === "" || !isValidSimDate($data["dataDisattivazione"])) {
            $errors[] = "Data di disattivazione non valida.";
        }

        if (
            isValidSimDate($data["dataAttivazione"]) &&
            isValidSimDate($data["dataDisattivazione"]) &&
            $data["dataDisattivazione"] < $data["dataAttivazione"]
        ) {
            $errors[] = "La data di disattivazione non può precedere la data di attivazione.";
        }

        return $errors;
    }

    $errors[] = "Stato SIM non gestibile da questo flusso.";
    return $errors;
}
