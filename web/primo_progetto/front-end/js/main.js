import { getAppDomRefs } from "./app/domRefs.js?v=rmk-architecture-v1";
import { getDashboardFilters } from "./app/filters.js?v=rmk-architecture-v1";
import { setLayout } from "./app/navigation.js?v=rmk-architecture-v1";
import { getRouteData, setContractsDetailPage } from "./app/routeState.js?v=rmk-architecture-v1";
import { VERSION } from "./app/version.js?v=rmk-architecture-v1";

const refs = getAppDomRefs();

function showLoading(title) {
  refs.appContent.innerHTML = `
    <h2>${title}</h2>
    <p>Caricamento...</p>
  `;
}

async function renderRoute(path, params) {
  if (path === "#/dashboard") {
    showLoading("Dashboard");
    const { renderDashboard } = await import(`./pages/dashboard.js?v=${VERSION}`);
    renderDashboard(refs.appContent);
    return;
  }

  if (path === "#/contratti") {
    showLoading("Contratti");
    const { renderContractsPreview } = await import(`./pages/contracts/contractsPreview.js?v=${VERSION}`);
    renderContractsPreview(refs.appContent, getDashboardFilters(refs));
    return;
  }

  if (path === "#/contratti-dettaglio") {
    showLoading("Contratti");
    const { renderContractsList } = await import(`./pages/contracts/contractsList.js?v=${VERSION}`);
    renderContractsList(
      refs.appContent,
      getDashboardFilters(refs),
      params.get("page"),
      params.get("sort") || "dataAttivazione",
      params.get("direction") || "desc"
    );
    return;
  }

  if (path === "#/contratto") {
    showLoading("Dettaglio contratto");
    const { renderContractDetail } = await import(`./pages/contracts/contractDetail.js?v=${VERSION}`);
    renderContractDetail(refs.appContent, params.get("numero"));
    return;
  }

  if (path === "#/sim") {
    showLoading("Gestione SIM");
    const { renderSimPreview } = await import(`./pages/sim/simPreview.js?v=${VERSION}`);
    renderSimPreview(refs.appContent);
    return;
  }

  if (path === "#/sim-dettaglio") {
    showLoading("Gestione SIM");
    const { renderSimList } = await import(`./pages/sim/simList.js?v=${VERSION}`);
    renderSimList(refs.appContent, params);
    return;
  }

  if (path === "#/telefonate") {
    showLoading("Telefonate");
    const { renderCallsPreview } = await import(`./pages/calls/callsPreview.js?v=${VERSION}`);
    renderCallsPreview(refs.appContent, params);
    return;
  }

  if (path === "#/telefonate-dettaglio") {
    showLoading("Telefonate");
    const { renderCallsList } = await import(`./pages/calls/callsList.js?v=${VERSION}`);
    renderCallsList(refs.appContent, params);
    return;
  }

  window.location.hash = "#/dashboard";
}

async function router() {
  const { path, params } = getRouteData();

  setLayout(refs, path);

  try {
    await renderRoute(path, params);
  } catch (error) {
    refs.appContent.innerHTML = `
      <h2>Errore</h2>
      <p>Errore nel caricamento della sezione richiesta.</p>
    `;
  }
}

function bindGlobalFilters() {
  if (!refs.filterForm) {
    return;
  }

  refs.filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const { path, params } = getRouteData();

    if (path === "#/contratti-dettaglio") {
      if (!setContractsDetailPage(1, params.get("sort") || "dataAttivazione", params.get("direction") || "desc")) {
        router();
      }
      return;
    }

    router();
  });

  refs.filterForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      const { path, params } = getRouteData();

      if (path === "#/contratti-dettaglio") {
        if (!setContractsDetailPage(1, params.get("sort") || "dataAttivazione", params.get("direction") || "desc")) {
          router();
        }
        return;
      }

      router();
    }, 0);
  });
}

bindGlobalFilters();
window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);
