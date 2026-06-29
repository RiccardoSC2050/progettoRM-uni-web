import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v1";

const SIM_TYPES = ["standard", "microSIM", "nanoSIM", "eSIM"];

export function renderTypeOptions(selected = "standard") {
  return SIM_TYPES.map((type) => `
    <option value="${type}" ${type === selected ? "selected" : ""}>${type}</option>
  `).join("");
}

export function renderContractOptions(contractOptions = [], selected = "") {
  const normalizedSelected = selected || "";
  const uniqueOptions = Array.from(new Set([normalizedSelected, ...contractOptions].filter(Boolean)));
  const options = uniqueOptions
    .map((numero) => `
      <option value="${escapeHtml(numero)}" ${numero === normalizedSelected ? "selected" : ""}>${escapeHtml(numero)}</option>
    `)
    .join("");

  return `
    <option value="">Seleziona un contratto disponibile</option>
    ${options}
  `;
}
