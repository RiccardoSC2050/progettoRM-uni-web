import {
  formatCompactCurrency,
  formatCurrency,
  formatDuration,
  formatNumber
} from "./callsFormatters.js?v=rmk-sim-db-v5";

export function renderCallsSummary(summary = {}) {
  const cards = [
    { label: "Entrate totali", value: formatCompactCurrency(summary.entrateTotali), title: formatCurrency(summary.entrateTotali), compact: true },
    { label: "Telefonate", value: formatNumber(summary.totaleTelefonate) },
    { label: "Costo medio", value: formatCurrency(summary.costoMedio) },
    { label: "Durata media", value: formatDuration(Math.round(summary.durataMedia || 0)) },
    { label: "Contratti coinvolti", value: formatNumber(summary.contrattiCoinvolti) }
  ];

  return `
    <section class="calls-summary-grid">
      ${cards
        .map((card) => `
          <article class="calls-summary-card ${card.compact ? "calls-summary-card-compact" : ""}">
            <strong title="${card.title || card.value}">${card.value}</strong>
            <span>${card.label}</span>
          </article>
        `)
        .join("")}
    </section>
  `;
}
