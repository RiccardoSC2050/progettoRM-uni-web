export { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-architecture-v1";

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("it-IT");
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = String(value).split("-");
  return `${day}/${month}/${year}`;
}
