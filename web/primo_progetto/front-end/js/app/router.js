import { getDashboardFilters } from "./filters.js?v=rmk-sim-db-v1";
import { setLayout } from "./navigation.js?v=rmk-sim-db-v1";
import { getRouteData } from "./routeState.js?v=rmk-sim-db-v1";
import { showLoading } from "./loading.js?v=rmk-sim-db-v1";
import { VERSION } from "./version.js?v=rmk-sim-db-v1";

async function renderRoute(refs, path, params) {
  if (path === "#/dashboard") {
    showLoading(refs.appContent, "Dashboard");
    const { renderDashboard } = await import(`../pages/dashboard.js?v=${VERSION}`);
    renderDashboard(refs.appContent);
    return;
  }

  if (path === "#/contratti") {
    showLoading(refs.appContent, "Contratti");
    const { renderContractsPreview } = await import(`../pages/contracts/contractsPreview.js?v=${VERSION}`);
    renderContractsPreview(refs.appContent, getDashboardFilters(refs));
    return;
  }

  if (path === "#/contratti-dettaglio") {
    showLoading(refs.appContent, "Contratti");
    const { renderContractsList } = await import(`../pages/contracts/contractsList.js?v=${VERSION}`);
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
    showLoading(refs.appContent, "Dettaglio contratto");
    const { renderContractDetail } = await import(`../pages/contracts/contractDetail.js?v=${VERSION}`);
    renderContractDetail(refs.appContent, params.get("numero"));
    return;
  }

  if (path === "#/sim") {
    showLoading(refs.appContent, "Gestione SIM");
    const { renderSimPreview } = await import(`../pages/sim/simPreview.js?v=${VERSION}`);
    renderSimPreview(refs.appContent);
    return;
  }

  if (path === "#/sim-dettaglio") {
    showLoading(refs.appContent, "Gestione SIM");
    const { renderSimList } = await import(`../pages/sim/simList.js?v=${VERSION}`);
    renderSimList(refs.appContent, params);
    return;
  }


  if (path === "#/sim-configura") {
    showLoading(refs.appContent, "Configura SIM");
    const { renderSimConfigurePage } = await import(`../pages/sim/simConfigurePage.js?v=${VERSION}`);
    renderSimConfigurePage(refs.appContent, params);
    return;
  }

  if (path === "#/telefonate") {
    showLoading(refs.appContent, "Telefonate");
    const { renderCallsPreview } = await import(`../pages/calls/callsPreview.js?v=${VERSION}`);
    renderCallsPreview(refs.appContent, params);
    return;
  }

  if (path === "#/telefonate-dettaglio") {
    showLoading(refs.appContent, "Telefonate");
    const { renderCallsList } = await import(`../pages/calls/callsList.js?v=${VERSION}`);
    renderCallsList(refs.appContent, params);
    return;
  }

  window.location.hash = "#/dashboard";
}

export async function router(refs) {
  const { path, params } = getRouteData();

  setLayout(refs, path);

  try {
    await renderRoute(refs, path, params);
  } catch (error) {
    refs.appContent.innerHTML = `
      <h2>Errore</h2>
      <p>Errore nel caricamento della sezione richiesta.</p>
    `;
  }
}
