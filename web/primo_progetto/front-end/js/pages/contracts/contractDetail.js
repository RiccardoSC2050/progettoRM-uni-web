import { getContractCalls, getContractDetail } from "../../api/contractsApi.js?v=rmk-calls-pagination-v1";
import {
  formatContractType,
  formatContractValue,
  formatCurrency,
  formatDate,
  formatNumber
} from "./contractsFormatters.js?v=rmk-calls-pagination-v1";

const CALLS_PAGE_SIZE = 5;

function getRangeStart(page, total, count) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return (page - 1) * CALLS_PAGE_SIZE + 1;
}

function getRangeEnd(page, total, count) {
  if (total === 0 || count === 0) {
    return 0;
  }

  return Math.min(page * CALLS_PAGE_SIZE, total);
}

function getCallsFilters(container) {
  const form = container.querySelector(".contract-calls-filter-form");

  if (!form) {
    return {};
  }

  const formData = new FormData(form);

  return {
    id: String(formData.get("id") || "").trim(),
    data: String(formData.get("data") || ""),
    minDurata: String(formData.get("minDurata") || "").trim(),
    maxCosto: String(formData.get("maxCosto") || "").trim()
  };
}

function renderContractCards(contract) {
  const simLabel = contract.tipoSIM || "Nessuna SIM attiva";

  return `
    <section class="contract-detail-summary">
      <article>
        <span>Tipo contratto</span>
        <strong>${formatContractType(contract.tipo)}</strong>
      </article>

      <article>
        <span>Data attivazione</span>
        <strong>${formatDate(contract.dataAttivazione)}</strong>
      </article>

      <article>
        <span>Credito / minuti</span>
        <strong>${formatContractValue(contract)}</strong>
      </article>

      <article>
        <span>SIM associata</span>
        <strong>${simLabel}</strong>
      </article>

      <article>
        <span>Telefonate</span>
        <strong>${formatNumber(contract.numeroTelefonate)}</strong>
      </article>

      <article>
        <span>Costo totale</span>
        <strong>${formatCurrency(contract.costoTotale)}</strong>
      </article>
    </section>
  `;
}

function renderCallsFilter() {
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

function renderCallsTable(calls) {
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
                <td class="call-cell-id">${formatNumber(call.id)}</td>
                <td class="call-cell-date">${formatDate(call.data)}</td>
                <td class="call-cell-time">${call.ora}</td>
                <td class="call-cell-duration">${formatNumber(call.durata)} s</td>
                <td class="call-cell-cost">${formatCurrency(call.costo)}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function renderCalls(container, numero, page = 1, filters = {}) {
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * CALLS_PAGE_SIZE;
  const callsContainer = container.querySelector(".contract-calls-content");

  if (!callsContainer) {
    return;
  }

  callsContainer.innerHTML = `<p class="contracts-empty">Caricamento telefonate...</p>`;

  try {
    const result = await getContractCalls({
      numero,
      ...filters,
      limit: CALLS_PAGE_SIZE,
      offset
    });

    if (!result.success) {
      callsContainer.innerHTML = `<p class="contracts-empty">Errore: ${result.message}</p>`;
      return;
    }

    const { totale, telefonate, hasNext, hasPrevious } = result.data;
    const start = getRangeStart(currentPage, totale, telefonate.length);
    const end = getRangeEnd(currentPage, totale, telefonate.length);

    callsContainer.innerHTML = `
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

    callsContainer.querySelectorAll(".contract-calls-page-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = Number(button.dataset.page);

        if (Number.isFinite(nextPage) && nextPage > 0) {
          renderCalls(container, numero, nextPage, getCallsFilters(container));
        }
      });
    });
  } catch (error) {
    callsContainer.innerHTML = `<p class="contracts-empty">Errore nel caricamento delle telefonate.</p>`;
  }
}

export async function renderContractDetail(container, numero) {
  if (!numero) {
    container.innerHTML = `
      <section class="contracts-page contract-detail-page">
        <p class="contracts-empty">Numero contratto non specificato.</p>
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <h2>Dettaglio contratto</h2>
    <p>Caricamento contratto...</p>
  `;

  try {
    const result = await getContractDetail(numero);

    if (!result.success) {
      container.innerHTML = `
        <h2>Dettaglio contratto</h2>
        <p>Errore: ${result.message}</p>
      `;
      return;
    }

    const contract = result.data;

    container.innerHTML = `
      <section class="contracts-page contract-detail-page">
        <header class="contracts-header">
          <div class="contracts-header-text">
            <h2>Contratto ${contract.numero}</h2>
            <p>Dettaglio del contratto telefonico selezionato.</p>
          </div>

          <a class="contracts-detail-link" href="#/contratti-dettaglio">Torna ai contratti</a>
        </header>

        ${renderContractCards(contract)}

        <section class="contract-calls-section">
          ${renderCallsFilter()}
          <div class="contract-calls-content"></div>
        </section>
      </section>
    `;

    const filterForm = container.querySelector(".contract-calls-filter-form");

    if (filterForm) {
      filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        renderCalls(container, contract.numero, 1, getCallsFilters(container));
      });

      filterForm.addEventListener("reset", () => {
        window.setTimeout(() => {
          renderCalls(container, contract.numero, 1, {});
        }, 0);
      });
    }

    renderCalls(container, contract.numero, 1, {});
  } catch (error) {
    container.innerHTML = `
      <h2>Dettaglio contratto</h2>
      <p>Errore nel caricamento del dettaglio contratto.</p>
    `;
  }
}
