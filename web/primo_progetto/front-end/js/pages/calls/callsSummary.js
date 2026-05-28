import {
  formatCurrency,
  formatDuration,
  formatNumber
} from "./callsFormatters.js?v=rmk-telefonate-v1";

export function renderCallsSummary(summary = {}) {
  const cards = [
    ["Entrate totali", formatCurrency(summary.entrateTotali)],
    ["Telefonate", formatNumber(summary.totaleTelefonate)],
    ["Costo medio", formatCurrency(summary.costoMedio)],
    ["Durata media", formatDuration(Math.round(summary.durataMedia || 0))],
    ["Contratti coinvolti", formatNumber(summary.contrattiCoinvolti)]
  ];

  return `
    <section class="calls-summary-grid">
      ${cards
        .map(([label, value]) => `
          <article class="calls-summary-card">
            <strong>${value}</strong>
            <span>${label}</span>
          </article>
        `)
        .join("")}
    </section>
  `;
}
