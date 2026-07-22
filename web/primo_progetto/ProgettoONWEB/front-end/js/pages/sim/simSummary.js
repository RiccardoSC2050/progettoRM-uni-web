import { formatNumber } from "./simFormatters.js?v=rmk-sim-db-v5";

export function renderSimSummary(summary = {}) {
  const cards = [
    ["SIM totali", summary.totale],
    ["Attive", summary.attive],
    ["Disattivate", summary.disattive],
    ["Non attive", summary.nonAttive],
    ["eSIM", summary.eSIM]
  ];

  return `
    <section class="sim-summary-grid">
      ${cards
        .map(([label, value]) => `
          <article class="sim-summary-card">
            <strong>${formatNumber(value)}</strong>
            <span>${label}</span>
          </article>
        `)
        .join("")}
    </section>
  `;
}
