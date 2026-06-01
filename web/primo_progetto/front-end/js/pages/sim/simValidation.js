import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v1";
import { bindSimContractSuggestions } from "./simContractSuggestions.js?v=rmk-sim-db-v1";

const SIM_CODE_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;
const PHONE_PATTERN = /^\+?[0-9]{8,16}$/;

function field(form, name) {
  return form.elements[name] || null;
}

function valueOf(form, name) {
  return field(form, name)?.value?.trim() || "";
}

function setInvalid(form, names) {
  Array.from(form.elements).forEach((element) => {
    element.classList?.remove("is-invalid");
  });

  names.forEach((name) => {
    field(form, name)?.classList?.add("is-invalid");
  });
}

function messageBox(form) {
  return form.querySelector("[data-sim-form-message]");
}

function setFieldVisibility(wrapper, visible) {
  if (!wrapper) {
    return;
  }

  wrapper.hidden = !visible;
  wrapper.querySelectorAll("input, select").forEach((element) => {
    element.disabled = !visible;
  });
}

function setDateOptionsVisibility(form, visible) {
  const dateOptions = form.querySelector("[data-sim-date-options]");

  if (dateOptions) {
    dateOptions.hidden = !visible;
  }
}

function setDateNote(form, text) {
  const note = form.querySelector("[data-sim-date-note]");

  if (note) {
    note.textContent = text;
  }
}

function getOriginalStatus(form) {
  return valueOf(form, "statoOriginale");
}

function getIntent(form) {
  return form.dataset.intent || "";
}

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

export function getSimFormStatus(form) {
  return valueOf(form, "statoFinale") || "non_attiva";
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
  const status = getSimFormStatus(form);
  const errors = [];
  const invalidFields = [];
  const codice = valueOf(form, "codice");
  const tipoSIM = valueOf(form, "tipoSIM");
  const contratto = valueOf(form, "contratto");

  if (!SIM_CODE_PATTERN.test(codice)) {
    errors.push("Codice SIM: usa 3-30 caratteri, solo lettere, numeri, trattino o underscore. Esempio: SIM260001.");
    invalidFields.push("codice");
  }

  if (!["standard", "microSIM", "nanoSIM", "eSIM"].includes(tipoSIM)) {
    errors.push("Tipo SIM: scegli uno dei valori disponibili nel menu.");
    invalidFields.push("tipoSIM");
  }

  if (status === "attiva") {
    if (!PHONE_PATTERN.test(contratto)) {
      errors.push("Contratto: scegli un numero suggerito o inserisci un contratto esistente senza SIM attiva.");
      invalidFields.push("contratto");
    }
  }

  if (status === "disattiva") {
    if (!PHONE_PATTERN.test(contratto)) {
      errors.push("Contratto storico non valido.");
      invalidFields.push("contratto");
    }

    // La disattivazione è immediata: il backend conserva la data di attivazione storica e imposta la data odierna come data di disattivazione.
  }

  setInvalid(form, invalidFields);

  if (errors.length > 0) {
    showSimFormMessage(form, "error", errors);
    return false;
  }

  clearSimFormMessage(form);
  return true;
}

function buildExample(index) {
  const seed = String(Date.now() + index).slice(-8);

  return {
    codice: `SIM${seed}`,
    tipoSIM: ["standard", "nanoSIM", "eSIM"][index % 3],
    statoFinale: "non_attiva",
    contratto: "",
    dataAttivazione: "",
    dataDisattivazione: ""
  };
}

function fillExample(form, example) {
  Object.entries(example).forEach(([name, value]) => {
    const element = field(form, name);

    if (element) {
      element.value = value;
    }
  });

  clearSimFormMessage(form);
  updateSimFormState(form);
}

export function bindSimFormAssistance(form, options = {}) {
  const exampleContainer = form.querySelector("[data-sim-examples]");

  bindSimContractSuggestions(form, options.contractOptions || []);

  if (exampleContainer && form.dataset.mode === "create") {
    const examples = [0, 1, 2].map((index) => buildExample(index));

    exampleContainer.innerHTML = examples.map((example, index) => `
      <button class="sim-example-btn" type="button" data-sim-example="${index}">
        Esempio ${index + 1}: ${escapeHtml(example.codice)} · ${escapeHtml(example.tipoSIM)}
      </button>
    `).join("");

    exampleContainer.querySelectorAll("[data-sim-example]").forEach((button) => {
      button.addEventListener("click", () => {
        fillExample(form, examples[Number(button.dataset.simExample)]);
      });
    });
  }

  form.addEventListener("input", () => {
    if (messageBox(form)?.classList.contains("sim-form-message-error")) {
      clearSimFormMessage(form);
    }
  });

  updateSimFormState(form);
}
