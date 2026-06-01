import { formatNumber } from "./contractsFormatters.js?v=rmk-sim-db-v1";

export function renderContractsSummary(summary) {
  return `
    <section class="contracts-summary" aria-label="Resoconto contratti">
      <article class="contracts-summary-card">
        <strong>${formatNumber(summary.totale)}</strong>
        <span>Contratti totali</span>
      </article>

      <article class="contracts-summary-card">
        <strong>${formatNumber(summary.ricarica)}</strong>
        <span>Ricarica</span>
      </article>

      <article class="contracts-summary-card">
        <strong>${formatNumber(summary.consumo)}</strong>
        <span>Consumo</span>
      </article>

      <article class="contracts-summary-card">
        <strong>${formatNumber(summary.senzaSIM)}</strong>
        <span>Senza SIM attiva</span>
      </article>
    </section>
  `;
}
