import { escapeHtml } from "../../../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { formatCurrency, formatDate, formatNumber } from "../../contractsFormatters.js?v=rmk-sim-db-v5";

export function renderCallsFilter() {
  return `
    <section class="contract-calls-filter-card">
      <header>
        <h3>Filtro telefonate</h3>
      </header>

      <form class="contract-calls-filter-form">
        <div class="contract-calls-filter-fields">
          <div class="contract-calls-field">
            <label for="calls-filter-id">ID telefonata</label>
            <input id="calls-filter-id" name="id" type="text" placeholder="Es. 12" />
          </div>

          <div class="contract-calls-field">
            <label for="calls-filter-date">Data</label>
            <input id="calls-filter-date" name="data" type="date" />
          </div>

          <div class="contract-calls-field">
            <label for="calls-filter-duration">Durata min.</label>
            <input id="calls-filter-duration" name="minDurata" type="number" min="0" placeholder="Secondi" />
          </div>

          <div class="contract-calls-field">
            <label for="calls-filter-cost">Costo max.</label>
            <input id="calls-filter-cost" name="maxCosto" type="number" min="0" step="0.01" placeholder="Euro" />
          </div>
        </div>

        <div class="contract-calls-filter-actions">
          <button class="dashboard-btn dashboard-btn-primary" type="submit">Applica</button>
          <button class="dashboard-btn dashboard-btn-secondary" type="reset">Reset</button>
        </div>
      </form>
    </section>
  `;
}

export function renderCallsTable(calls) {
  return `
    <div class="contract-calls-table-wrapper">
      <table class="contract-calls-table">
        <thead>
          <tr>
            <th class="call-cell-id">ID</th>
            <th class="call-cell-date">Data</th>
            <th class="call-cell-time">Ora</th>
            <th class="call-cell-duration">Durata</th>
            <th class="call-cell-cost">Costo</th>
          </tr>
        </thead>
        <tbody>
          ${calls
            .map((call) => `
              <tr>
                <td class="call-cell-id" data-label="ID">${formatNumber(call.id)}</td>
                <td class="call-cell-date" data-label="Data">${formatDate(call.data)}</td>
                <td class="call-cell-time" data-label="Ora">${escapeHtml(call.ora)}</td>
                <td class="call-cell-duration" data-label="Durata">${formatNumber(call.durata)} s</td>
                <td class="call-cell-cost" data-label="Costo">${formatCurrency(call.costo)}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function renderCallsList({ start, end, totale, telefonate, currentPage, hasNext, hasPrevious }) {
  return `
    <header class="contract-calls-header">
      <div>
        <h3>Telefonate</h3>
        <p>Mostrate ${formatNumber(start)}-${formatNumber(end)} di ${formatNumber(totale)}</p>
      </div>
    </header>

    ${telefonate.length > 0 ? renderCallsTable(telefonate) : `<p class="contracts-empty">Nessuna telefonata trovata.</p>`}

    <nav class="contracts-pagination" aria-label="Paginazione telefonate">
      <button class="contracts-page-btn contract-calls-page-btn" type="button" data-page="${currentPage - 1}" ${!hasPrevious ? "disabled" : ""}>‹</button>
      <span>Pagina ${formatNumber(currentPage)}</span>
      <button class="contracts-page-btn contract-calls-page-btn" type="button" data-page="${currentPage + 1}" ${!hasNext ? "disabled" : ""}>›</button>
    </nav>
  `;
}
