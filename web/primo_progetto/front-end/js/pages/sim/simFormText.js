export function getContractValue(sim) {
  return sim?.contratto || sim?.eraAssociataA || "";
}

export function getFormText(mode, intent, sim) {
  if (mode !== "edit") {
    return {
      title: "Nuova SIM",
      description: "Inserisci codice e tipo. Dopo la creazione potrai decidere se collegarla a un contratto."
    };
  }

  if (intent === "activate") {
    return {
      title: "Attiva SIM",
      description: "Scegli solo il contratto libero. La data di attivazione viene impostata automaticamente a oggi dal backend."
    };
  }

  if (intent === "deactivate") {
    return {
      title: "Disattiva SIM",
      description: "La SIM viene spostata subito nello storico delle SIM disattivate. La data effettiva di disattivazione viene impostata a oggi dal backend."
    };
  }

  return {
    title: "Modifica SIM",
    description: sim?.stato === "attiva"
      ? "Puoi modificare codice e tipo. Per cambiare contratto devi prima disattivare la SIM e poi riattivarla."
      : "Aggiorna codice e tipo della SIM. Per usarla, premi Attiva dall’elenco."
  };
}

export function isReadOnlyContract(intent, sim) {
  return intent === "deactivate" || sim?.stato === "attiva";
}

export function getSubmitLabel(mode, intent) {
  if (mode === "create") {
    return "Crea SIM";
  }

  if (intent === "activate") {
    return "Attiva SIM";
  }

  if (intent === "deactivate") {
    return "Disattiva SIM";
  }

  return "Salva";
}
