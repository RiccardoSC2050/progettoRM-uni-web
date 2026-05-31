<?php

require_once __DIR__ . "/../core/response.php";
require_once __DIR__ . "/../repositories/simDisattiveRepository.php";
require_once __DIR__ . "/simDisattiveValidation.php";

function getSimDisattiveData(mysqli $conn, array $filters): array
{
    return fetchSimDisattive($conn, $filters);
}

function createSimDisattivaData(mysqli $conn, array $input): string
{
    $data = normalizeSimInput($input);
    $errors = validateSimData($data, false);

    if (count($errors) > 0) {
        sendError(implode(" ", $errors), 422);
    }

    if (!contractExistsForSim($conn, $data["eraAssociataA"])) {
        sendError("Il contratto indicato non esiste. Inserisci un numero presente in ContrattoTelefonico: puoi copiarlo dalla sezione Contratti o usare uno dei suggerimenti del form.", 422);
    }

    if (simCodeExistsInAnyTable($conn, $data["codice"])) {
        sendError("Il codice SIM è già presente nel database. Usa un codice nuovo, ad esempio SIM260001 o un altro codice non ancora registrato.", 422);
    }

    insertSimDisattiva($conn, $data);
    return "SIM disattivata creata correttamente.";
}

function updateSimDisattivaData(mysqli $conn, array $input): string
{
    $codiceOriginale = trim($input["codiceOriginale"] ?? $input["codice"] ?? "");
    $data = normalizeSimInput($input);

    if ($codiceOriginale === "") {
        sendError("Codice originale mancante.", 422);
    }

    if (!simDisattivaExistsByCode($conn, $codiceOriginale)) {
        sendError("La SIM selezionata non è più presente tra le SIM disattive.", 404);
    }

    $errors = validateSimData($data, true);

    if (count($errors) > 0) {
        sendError(implode(" ", $errors), 422);
    }

    if (!contractExistsForSim($conn, $data["eraAssociataA"])) {
        sendError("Il contratto indicato non esiste. Copia un numero reale dalla sezione Contratti o usa un suggerimento del form.", 422);
    }

    if (simCodeExistsInAnyTable($conn, $data["codice"], $codiceOriginale)) {
        sendError("Il codice SIM è già presente nel database.", 422);
    }

    if ($data["statoFinale"] === "attiva") {
        if (activeContractHasSim($conn, $data["eraAssociataA"], $data["codice"])) {
            sendError("Il contratto indicato ha già una SIM attiva. Scegli un contratto senza SIM attiva oppure lascia la SIM come disattivata.", 422);
        }

        reactivateSimDisattiva($conn, $codiceOriginale, $data);
        return "SIM riattivata correttamente: ora è registrata tra le SIM attive e non comparirà più tra le SIM disattive.";
    }

    $affectedRows = updateSimDisattivaByCode($conn, $codiceOriginale, $data);

    return $affectedRows === 0
        ? "Nessuna modifica applicata: i dati della SIM erano già aggiornati."
        : "SIM disattivata aggiornata correttamente.";
}

function deleteSimDisattivaData(mysqli $conn, array $input): string
{
    $codice = trim($input["codice"] ?? "");

    if ($codice === "") {
        sendError("Codice SIM mancante.", 422);
    }

    if (deleteSimDisattivaByCode($conn, $codice) === 0) {
        sendError("SIM non trovata tra le SIM disattive.", 404);
    }

    return "SIM disattiva eliminata correttamente.";
}
