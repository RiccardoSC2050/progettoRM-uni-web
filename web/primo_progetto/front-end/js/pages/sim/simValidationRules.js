import { valueOf } from "./simFormDom.js?v=rmk-sim-db-v5";

const SIM_CODE_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;
const PHONE_PATTERN = /^\+?[0-9]{8,16}$/;
const SIM_TYPES = ["standard", "microSIM", "nanoSIM", "eSIM"];

function addError(errors, invalidFields, fieldName, message) {
  errors.push(message);
  invalidFields.push(fieldName);
}

export function getSimFormStatus(form) {
  return valueOf(form, "statoFinale") || "non_attiva";
}

export function validateSimFields(form) {
  const status = getSimFormStatus(form);
  const errors = [];
  const invalidFields = [];
  const codice = valueOf(form, "codice");
  const tipoSIM = valueOf(form, "tipoSIM");
  const contratto = valueOf(form, "contratto");

  if (!SIM_CODE_PATTERN.test(codice)) {
    addError(
      errors,
      invalidFields,
      "codice",
      "Codice SIM: usa 3-30 caratteri, solo lettere, numeri, trattino o underscore. Esempio: SIM260001."
    );
  }

  if (!SIM_TYPES.includes(tipoSIM)) {
    addError(
      errors,
      invalidFields,
      "tipoSIM",
      "Tipo SIM: scegli uno dei valori disponibili nel menu."
    );
  }

  if (status === "attiva" && !PHONE_PATTERN.test(contratto)) {
    addError(
      errors,
      invalidFields,
      "contratto",
      "Contratto: scegli un numero suggerito o inserisci un contratto esistente senza SIM attiva."
    );
  }

  if (status === "disattiva" && !PHONE_PATTERN.test(contratto)) {
    addError(errors, invalidFields, "contratto", "Contratto storico non valido.");
  }

  return { errors, invalidFields };
}
