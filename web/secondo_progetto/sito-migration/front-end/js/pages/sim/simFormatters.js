export { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";

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

export function formatSimStatus(status) {
  const labels = {
    attiva: "Attiva",
    disattiva: "Disattivata",
    non_attiva: "Non attiva"
  };

  return labels[status] || "-";
}
