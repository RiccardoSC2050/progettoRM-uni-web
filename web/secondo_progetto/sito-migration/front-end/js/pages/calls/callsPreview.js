import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { getCallsSummary } from "../../api/callsApi.js?v=rmk-sim-db-v5";
import { renderCallsChart, renderCallsYearSelector } from "./callsChart.js?v=rmk-sim-db-v5";
import { renderCallsSummary } from "./callsSummary.js?v=rmk-sim-db-v5";
import { renderCallsTable } from "./callsTable.js?v=rmk-sim-db-v5";

function setCallsYearInUrl(year) {
  const params = new URLSearchParams();

  if (year) {
    params.set("year", year);
  }

  history.replaceState(null, "", `#/telefonate?${params.toString()}`);
}

export async function renderCallsPreview(container, params = new URLSearchParams()) {
  const selectedYear = params.get("year") || "";

  container.innerHTML = `
    <h2>Telefonate</h2>
    <p>Caricamento resoconto telefonate...</p>
  `;

  try {
    const result = await getCallsSummary({ year: selectedYear });

    if (!result.success) {
      container.innerHTML = `
        <h2>Telefonate</h2>
        <p>Errore: ${escapeHtml(result.message)}</p>
      `;
      return;
    }

    const { summary, monthly, latest, years, year } = result.data;

    container.innerHTML = `
      <section class="calls-page calls-preview-page">
        <header class="calls-page-header">
          <div>
            <h2>Telefonate</h2>
            <p>Resoconto economico e operativo delle telefonate registrate.</p>
          </div>
        </header>

        ${renderCallsSummary(summary)}

        <section class="calls-chart-section">
          ${renderCallsYearSelector(years, year)}
          <div class="calls-chart-slot">
            ${renderCallsChart(monthly)}
          </div>
        </section>

        <section class="calls-latest-card">
          <div class="calls-section-heading">
            <h3>Ultime telefonate</h3>
            <p>Le 5 telefonate più recenti registrate nel sistema.</p>
          </div>

          ${latest.length > 0 ? renderCallsTable(latest) : `<p class="calls-empty">Nessuna telefonata registrata.</p>`}
        </section>

        <div class="page-preview-actions">
          <a class="page-preview-link" href="#/telefonate-dettaglio">
            Approfondisci telefonate
          </a>
        </div>
      </section>
    `;

    bindYearSelector(container);
  } catch (error) {
    container.innerHTML = `
      <h2>Telefonate</h2>
      <p>Errore nel caricamento delle telefonate.</p>
    `;
  }
}

function bindYearSelector(container) {
  const form = container.querySelector(".calls-year-form");
  const chartSlot = container.querySelector(".calls-chart-slot");

  if (!form || !chartSlot) {
    return;
  }

  form.addEventListener("change", async () => {
    const data = new FormData(form);
    const year = data.get("year");

    chartSlot.innerHTML = `<p class="calls-empty">Aggiornamento grafico...</p>`;

    try {
      const result = await getCallsSummary({ year, mode: "chart" });

      if (!result.success) {
        chartSlot.innerHTML = `<p class="calls-empty">Errore: ${escapeHtml(result.message)}</p>`;
        return;
      }

      chartSlot.innerHTML = renderCallsChart(result.data.monthly);
      setCallsYearInUrl(year);
    } catch (error) {
      chartSlot.innerHTML = `<p class="calls-empty">Errore nell'aggiornamento del grafico.</p>`;
    }
  });
}
