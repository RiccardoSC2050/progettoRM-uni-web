import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v5";
import { field } from "./simFormDom.js?v=rmk-sim-db-v5";

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

function fillExample(form, example, callbacks) {
  Object.entries(example).forEach(([name, value]) => {
    const element = field(form, name);

    if (element) {
      element.value = value;
    }
  });

  callbacks.clearMessage(form);
  callbacks.updateState(form);
}

export function bindCreateExamples(form, callbacks) {
  const exampleContainer = form.querySelector("[data-sim-examples]");

  if (!exampleContainer || form.dataset.mode !== "create") {
    return;
  }

  const examples = [0, 1, 2].map((index) => buildExample(index));

  exampleContainer.innerHTML = examples.map((example, index) => `
    <button class="sim-example-btn" type="button" data-sim-example="${index}">
      Esempio ${index + 1}: ${escapeHtml(example.codice)} · ${escapeHtml(example.tipoSIM)}
    </button>
  `).join("");

  exampleContainer.querySelectorAll("[data-sim-example]").forEach((button) => {
    button.addEventListener("click", () => {
      fillExample(form, examples[Number(button.dataset.simExample)], callbacks);
    });
  });
}
