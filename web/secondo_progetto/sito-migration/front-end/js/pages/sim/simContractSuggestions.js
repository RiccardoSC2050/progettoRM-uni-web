import { getAvailableContractOptions } from "./simOptions.js?v=rmk-sim-db-v5";
import { renderContractOptions } from "./simFormOptions.js?v=rmk-sim-db-v5";

const SEARCH_DELAY_MS = 250;

function getSelectedContract(select) {
  return select?.value?.trim() || "";
}

function updateContractSelect(select, options, selected = "") {
  if (!select) {
    return;
  }

  select.innerHTML = renderContractOptions(options, selected);
  select.value = selected;
}

export function bindSimContractSuggestions(form, initialOptions = []) {
  const search = form.querySelector("[data-sim-contract-search]");
  const select = form.querySelector("[data-sim-contract-input]");

  if (!search || !select || select.disabled) {
    return;
  }

  let timer = null;
  let requestId = 0;

  updateContractSelect(select, initialOptions, getSelectedContract(select));

  search.addEventListener("input", () => {
    window.clearTimeout(timer);

    timer = window.setTimeout(async () => {
      const currentRequestId = ++requestId;
      const query = search.value.trim();
      const selected = getSelectedContract(select);
      const options = await getAvailableContractOptions(query, selected);

      if (currentRequestId !== requestId) {
        return;
      }

      updateContractSelect(select, options, selected);
    }, SEARCH_DELAY_MS);
  });
}
