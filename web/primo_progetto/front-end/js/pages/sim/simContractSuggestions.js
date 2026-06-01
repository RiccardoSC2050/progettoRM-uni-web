import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v1";
import { getAvailableContractOptions } from "./simOptions.js?v=rmk-sim-db-v1";

function renderOptions(datalist, options) {
  datalist.innerHTML = options
    .filter(Boolean)
    .map((numero) => `<option value="${escapeHtml(numero)}"></option>`)
    .join("");
}

function getDatalist(form, input) {
  const id = input?.getAttribute("list") || "";

  return id ? form.querySelector(`#${CSS.escape(id)}`) : null;
}

export function bindSimContractSuggestions(form, initialOptions = []) {
  const input = form.querySelector("[data-sim-contract-input]");
  const datalist = getDatalist(form, input);

  if (!input || !datalist) {
    return;
  }

  let timer = null;
  const currentContract = input.value.trim();

  renderOptions(datalist, initialOptions);

  input.addEventListener("input", () => {
    window.clearTimeout(timer);

    timer = window.setTimeout(async () => {
      const query = input.value.trim();
      const options = await getAvailableContractOptions(query, currentContract);
      renderOptions(datalist, options);
    }, 220);
  });
}
