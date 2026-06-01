<?php

require_once __DIR__ . "/../core/response.php";
require_once __DIR__ . "/../repositories/simRepository.php";
require_once __DIR__ . "/simValidation.php";

function getSimData(mysqli $conn, array $filters): array
{
    return fetchSim($conn, $filters);
}

function createSimData(mysqli $conn, array $input): string
{
    $data = normalizeSimInput($input);
    $data["statoFinale"] = "non_attiva";
    $data["contratto"] = "";
    $data["dataAttivazione"] = "";
    $data["dataDisattivazione"] = "";

    $errors = validateSimData($data);

    if (count($errors) > 0) {
        sendError(implode(" ", $errors), 422);
    }

    if (simCodeExistsInAnyTable($conn, $data["codice"])) {
        sendError("Il codice SIM è già presente nel database. Usa un codice nuovo, ad esempio SIM260001.", 422);
    }

    insertSimByState($conn, $data);

    return "SIM creata correttamente.";
}

function prepareDeactivateSimData(array $current, array $inputData): array
{
    return [
        "codiceOriginale" => $current["codice"],
        "statoOriginale" => "attiva",
        "codice" => $current["codice"],
        "tipoSIM" => $current["tipoSIM"],
        "contratto" => $current["contratto"],
        "dataAttivazione" => $current["dataAttivazione"],
        "dataDisattivazione" => getTodayForSim(),
        "statoFinale" => "disattiva"
    ];
}

function updateSimData(mysqli $conn, array $input): string
{
    $data = normalizeSimInput($input);

    if ($data["codiceOriginale"] === "") {
        sendError("Codice originale mancante.", 422);
    }

    $current = getSimByCode($conn, $data["codiceOriginale"]);

    if (!$current) {
        sendError("La SIM selezionata non è più presente nel database.", 404);
    }

    $data["statoOriginale"] = $current["stato"];

    if ($data["statoFinale"] === "disattiva") {
        if ($current["stato"] !== "attiva") {
            sendError("Puoi disattivare solo una SIM attiva.", 422);
        }

        $data = prepareDeactivateSimData($current, $data);
    }

    if ($current["stato"] === "disattiva" && $data["statoFinale"] !== "attiva") {
        sendError("Una SIM disattivata può essere riattivata oppure eliminata.", 422);
    }

    if ($current["stato"] === "non_attiva" && $data["statoFinale"] === "disattiva") {
        sendError("Una SIM senza contratto può essere mantenuta senza contratto oppure attivata.", 422);
    }

    if ($data["statoFinale"] === "non_attiva") {
        $data["contratto"] = "";
        $data["dataAttivazione"] = "";
        $data["dataDisattivazione"] = "";
    }

    if ($data["statoFinale"] === "attiva" && $current["stato"] !== "attiva") {
        $data["dataAttivazione"] = getTodayForSim();
        $data["dataDisattivazione"] = "";
    }

    if ($current["stato"] === "attiva" && $data["statoFinale"] === "attiva") {
        if ($data["contratto"] !== $current["contratto"]) {
            sendError("Non puoi cambiare direttamente il contratto di una SIM attiva. Disattivala prima e poi riattivala sul nuovo contratto.", 422);
        }

        $data["dataAttivazione"] = $current["dataAttivazione"];
        $data["dataDisattivazione"] = "";
    }

    if ($data["statoFinale"] === "attiva") {
        $data["dataDisattivazione"] = "";
    }

    $errors = validateSimData($data);

    if (count($errors) > 0) {
        sendError(implode(" ", $errors), 422);
    }

    if (simCodeExistsInAnyTable($conn, $data["codice"], $data["codiceOriginale"])) {
        sendError("Il codice SIM è già presente nel database.", 422);
    }

    if ($data["statoFinale"] === "attiva") {
        if (!contractExistsForSim($conn, $data["contratto"])) {
            sendError("Il contratto indicato non esiste. Usa un numero suggerito dal form oppure copia un contratto reale.", 422);
        }

        if (activeContractHasSim($conn, $data["contratto"], $data["codiceOriginale"])) {
            sendError("Il contratto indicato ha già una SIM attiva. Scegli un contratto senza SIM attiva.", 422);
        }

        $contractActivationDate = getContractActivationDateForSim($conn, $data["contratto"]);

        if ($contractActivationDate !== null && $data["dataAttivazione"] < $contractActivationDate) {
            sendError("La data di attivazione della SIM non può precedere la data di attivazione del contratto (" . $contractActivationDate . ").", 422);
        }
    }

    if ($data["statoFinale"] === "disattiva") {
        $contractActivationDate = getContractActivationDateForSim($conn, $data["contratto"]);

        if ($contractActivationDate !== null && $data["dataDisattivazione"] < $contractActivationDate) {
            sendError("La data di disattivazione della SIM non può precedere la data di attivazione del contratto (" . $contractActivationDate . ").", 422);
        }
    }

    replaceSimState($conn, $data["codiceOriginale"], $current["stato"], $data);

    if ($current["stato"] === "attiva" && $data["statoFinale"] === "disattiva") {
        return "SIM disattivata correttamente e salvata nello storico.";
    }

    if ($data["statoFinale"] === "attiva" && $current["stato"] !== "attiva") {
        return "SIM attivata correttamente.";
    }

    return "SIM aggiornata correttamente.";
}

function deleteSimData(mysqli $conn, array $input): string
{
    $codice = trim($input["codice"] ?? "");

    if ($codice === "") {
        sendError("Codice SIM mancante.", 422);
    }

    $current = getSimByCode($conn, $codice);

    if (!$current) {
        sendError("SIM non trovata.", 404);
    }

    if ($current["stato"] !== "disattiva") {
        sendError("Puoi eliminare solo SIM disattivate presenti nello storico.", 422);
    }

    if (deleteSimDisattivaByCode($conn, $codice) === 0) {
        sendError("SIM disattivata non trovata.", 404);
    }

    return "SIM disattivata eliminata correttamente.";
}
