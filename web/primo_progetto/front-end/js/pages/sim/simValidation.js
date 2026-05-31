import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-architecture-v1";
const SIM_CODE_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;
const PHONE_PATTERN = /^\+?[0-9]{8,16}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isValidDate(value) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

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
  return valueOf(form, "statoFinale") || "disattiva";
}

export function updateSimFormState(form) {
  const status = getSimFormStatus(form);
  const disactivation = field(form, "dataDisattivazione");

  if (!disactivation) {
    return;
  }

  if (status === "attiva") {
    disactivation.required = false;
    disactivation.disabled = true;
    disactivation.classList.remove("is-invalid");
    showSimFormMessage(
      form,
      "info",
      "La SIM verrà riattivata: sarà spostata in SIMAttiva e non comparirà più nell’elenco delle SIM disattive."
    );
    return;
  }

  disactivation.disabled = false;
  disactivation.required = true;

  if (messageBox(form)?.classList.contains("sim-form-message-info")) {
    clearSimFormMessage(form);
  }
}

export function validateSimFormBeforeSubmit(form) {
  const status = getSimFormStatus(form);
  const errors = [];
  const invalidFields = [];
  const codice = valueOf(form, "codice");
  const tipoSIM = valueOf(form, "tipoSIM");
  const contratto = valueOf(form, "eraAssociataA");
  const dataAttivazione = valueOf(form, "dataAttivazione");
  const dataDisattivazione = valueOf(form, "dataDisattivazione");

  if (!SIM_CODE_PATTERN.test(codice)) {
    errors.push("Codice SIM: usa 3-30 caratteri, solo lettere, numeri, trattino o underscore. Esempio: SIM260001.");
    invalidFields.push("codice");
  }

  if (!["standard", "microSIM", "nanoSIM", "eSIM"].includes(tipoSIM)) {
    errors.push("Tipo SIM: scegli uno dei valori disponibili nel menu.");
    invalidFields.push("tipoSIM");
  }

  if (!PHONE_PATTERN.test(contratto)) {
    errors.push("Contratto: inserisci un numero esistente, solo cifre con eventuale + iniziale. Esempio: +39320000000.");
    invalidFields.push("eraAssociataA");
  }

  if (!isValidDate(dataAttivazione)) {
    errors.push("Data attivazione: inserisci una data reale nel formato richiesto dal campo.");
    invalidFields.push("dataAttivazione");
  }

  if (status !== "attiva") {
    if (!isValidDate(dataDisattivazione)) {
      errors.push("Data disattivazione: inserisci una data reale.");
      invalidFields.push("dataDisattivazione");
    }

    if (
      isValidDate(dataAttivazione) &&
      isValidDate(dataDisattivazione) &&
      dataDisattivazione < dataAttivazione
    ) {
      errors.push("Data disattivazione: deve essere uguale o successiva alla data di attivazione.");
      invalidFields.push("dataDisattivazione");
    }
  }

  setInvalid(form, invalidFields);

  if (errors.length > 0) {
    showSimFormMessage(form, "error", errors);
    return false;
  }

  clearSimFormMessage(form);
  return true;
}

function buildExample(contract, index) {
  const seed = String(Date.now() + index).slice(-8);

  return {
    codice: `SIM${seed}`,
    tipoSIM: ["standard", "nanoSIM", "eSIM"][index % 3],
    eraAssociataA: contract || "+39320000000",
    dataAttivazione: dateOffset(-60 - index * 7),
    dataDisattivazione: dateOffset(-5 - index)
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
}

export function bindSimFormAssistance(form, options = {}) {
  const contracts = Array.isArray(options.contractOptions) ? options.contractOptions : [];
  const exampleContainer = form.querySelector("[data-sim-examples]");
  const statusField = field(form, "statoFinale");

  if (exampleContainer && form.dataset.mode === "create") {
    const examples = (contracts.length > 0 ? contracts.slice(0, 3) : ["", "", ""])
      .map((contract, index) => buildExample(contract, index));

    exampleContainer.innerHTML = examples.map((example, index) => `
      <button class="sim-example-btn" type="button" data-sim-example="${index}">
        Esempio ${index + 1}: ${escapeHtml(example.tipoSIM)} · ${escapeHtml(example.eraAssociataA)}
      </button>
    `).join("");

    exampleContainer.querySelectorAll("[data-sim-example]").forEach((button) => {
      button.addEventListener("click", () => {
        fillExample(form, examples[Number(button.dataset.simExample)]);
      });
    });
  }

  statusField?.addEventListener("change", () => updateSimFormState(form));
  form.addEventListener("input", () => {
    if (messageBox(form)?.classList.contains("sim-form-message-error")) {
      clearSimFormMessage(form);
    }
  });

  updateSimFormState(form);
}
