import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { bindSimContractSuggestions } from "./simContractSuggestions.js?v=rmk-sim-db-v5";
import { bindCreateExamples } from "./simExamples.js?v=rmk-sim-db-v5";
import { field, messageBox, setFieldVisibility, setInvalid, valueOf } from "./simFormDom.js?v=rmk-sim-db-v5";
import { getSimFormStatus, validateSimFields } from "./simValidationRules.js?v=rmk-sim-db-v5";

function getOriginalStatus(form) {
  return valueOf(form, "statoOriginale");
}

function getIntent(form) {
  return form.dataset.intent || "";
}

export { getSimFormStatus };

export function clearSimFormMessage(form) {
  const box = messageBox(form);

  if (!box) {
    return;
  }

  box.dataset.visible = "false";
  box.className = "sim-form-message";
  box.innerHTML = "";
  setInvalid(form, []);
}

export function showSimFormMessage(form, type, messages) {
  const box = messageBox(form);

  if (!box) {
    return;
  }

  const items = Array.isArray(messages) ? messages : [messages];
  box.dataset.visible = "true";
  box.className = `sim-form-message sim-form-message-${type}`;
  box.innerHTML = items.length === 1
    ? escapeHtml(items[0])
    : `<strong>Controlla questi dati:</strong><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function getUserFriendlySimError(error, fallback) {
  const raw = error?.message || "";

  try {
    const parsed = JSON.parse(raw);
    return parsed.message || fallback;
  } catch (_) {
    return raw && raw.length < 220 ? raw : fallback;
  }
}

export function updateSimFormState(form) {
  const status = getSimFormStatus(form);
  const originalStatus = getOriginalStatus(form);
  const intent = getIntent(form);
  const contractField = form.querySelector("[data-sim-contract-field]");
  const contract = field(form, "contratto");
  const needsContract = status === "attiva" || status === "disattiva";

  setFieldVisibility(contractField, needsContract);

  if (contract) {
    contract.required = needsContract;
  }

  if (status === "disattiva" && intent === "deactivate") {
    showSimFormMessage(form, "info", "Disattivazione immediata: la SIM verrà scollegata dal contratto e il backend registrerà automaticamente la data odierna nello storico.");
    return;
  }

  if (status === "non_attiva") {
    showSimFormMessage(form, "info", "SIM senza contratto: bastano codice e tipo. Dopo la creazione puoi attivarla dall'elenco.");
    return;
  }

  if (status === "attiva" && intent === "activate") {
    showSimFormMessage(form, "info", "Per attivare la SIM scegli un contratto libero. La data di attivazione sarà impostata automaticamente a oggi.");
    return;
  }

  if (status === "attiva" && originalStatus === "attiva") {
    showSimFormMessage(form, "info", "Puoi modificare codice e tipo. Il contratto resta bloccato: per cambiarlo usa Disattiva e poi Attiva sul nuovo contratto.");
  }
}

export function validateSimFormBeforeSubmit(form) {
  const { errors, invalidFields } = validateSimFields(form);

  setInvalid(form, invalidFields);

  if (errors.length > 0) {
    showSimFormMessage(form, "error", errors);
    return false;
  }

  clearSimFormMessage(form);
  return true;
}

export function bindSimFormAssistance(form, options = {}) {
  bindSimContractSuggestions(form, options.contractOptions || []);
  bindCreateExamples(form, {
    clearMessage: clearSimFormMessage,
    updateState: updateSimFormState
  });

  form.addEventListener("input", () => {
    if (messageBox(form)?.classList.contains("sim-form-message-error")) {
      clearSimFormMessage(form);
    }
  });

  updateSimFormState(form);
}
