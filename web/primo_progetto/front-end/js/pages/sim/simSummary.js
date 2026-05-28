import { formatNumber } from "./simFormatters.js?v=rmk-sim-responsive-v2";

export function renderSimSummary(summary = {}) {
  const cards = [
    ["SIM disattive", summary.totale],
    ["standard", summary.standard],
    ["microSIM", summary.microSIM],
    ["nanoSIM", summary.nanoSIM],
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
