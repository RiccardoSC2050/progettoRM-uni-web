import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { getContracts } from "../../api/contractsApi.js?v=rmk-sim-db-v5";
import { formatNumber } from "./contractsFormatters.js?v=rmk-sim-db-v5";
import { renderContractsTable } from "./contractsTable.js?v=rmk-sim-db-v5";
import { getResponsivePageSize } from "../../utils/responsivePageSize.js?v=rmk-sim-db-v5";

export async function renderContractsPreview(container, filters = {}) {
  container.innerHTML = `
    <h2>Contratti</h2>
    <p>Caricamento contratti...</p>
  `;

  try {
    const result = await getContracts({
      ...filters,
      limit: getResponsivePageSize(5, 3),
      offset: 0
    });

    if (!result.success) {
      container.innerHTML = `
        <h2>Contratti</h2>
        <p>Errore: ${escapeHtml(result.message)}</p>
      `;
      return;
    }

    const { totale, contratti } = result.data;
    const hasContracts = contratti.length > 0;

    container.innerHTML = `
      <section class="contracts-page contracts-preview-page">
        <header class="contracts-header">
          <div>
            <h2>Contratti</h2>
            <p>Primi contratti telefonici presenti nel database.</p>
          </div>

          <strong>${formatNumber(contratti.length)} / ${formatNumber(totale)}</strong>
        </header>

        ${
          hasContracts
            ? `
              ${renderContractsTable(contratti)}

              <div class="contracts-preview-actions page-preview-actions">
                <a class="contracts-detail-link page-preview-link" href="#/contratti-dettaglio">
                  Approfondisci contratti
                </a>
              </div>
            `
            : `<p class="contracts-empty">Nessun contratto trovato con i filtri selezionati.</p>`
        }
      </section>
    `;
  } catch (error) {
    container.innerHTML = `
      <h2>Contratti</h2>
      <p>Errore nel caricamento dei contratti.</p>
    `;
  }
}
