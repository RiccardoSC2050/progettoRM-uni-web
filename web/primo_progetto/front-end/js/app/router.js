import { getDashboardFilters } from "./filters.js?v=rmk-sim-db-v5";
import { setLayout } from "./navigation.js?v=rmk-sim-db-v5";
import { getRouteData } from "./routeState.js?v=rmk-sim-db-v5";
import { showLoading } from "./loading.js?v=rmk-sim-db-v5";
import { VERSION } from "./version.js?v=rmk-sim-db-v5";

const ROUTES = {
  "#/dashboard": {
    loadingLabel: "Dashboard",
    load: () => import(`../pages/dashboard.js?v=${VERSION}`),
    render: ({ module, refs }) => module.renderDashboard(refs.appContent)
  },
  "#/contratti": {
    loadingLabel: "Contratti",
    load: () => import(`../pages/contracts/contractsPreview.js?v=${VERSION}`),
    render: ({ module, refs }) => module.renderContractsPreview(refs.appContent, getDashboardFilters(refs))
  },
  "#/contratti-dettaglio": {
    loadingLabel: "Contratti",
    load: () => import(`../pages/contracts/contractsList.js?v=${VERSION}`),
    render: ({ module, refs, params }) => module.renderContractsList(
      refs.appContent,
      getDashboardFilters(refs),
      params.get("page"),
      params.get("sort") || "dataAttivazione",
      params.get("direction") || "desc"
    )
  },
  "#/contratto": {
    loadingLabel: "Dettaglio contratto",
    load: () => import(`../pages/contracts/contractDetail.js?v=${VERSION}`),
    render: ({ module, refs, params }) => module.renderContractDetail(refs.appContent, params.get("numero"))
  },
  "#/sim": {
    loadingLabel: "Gestione SIM",
    load: () => import(`../pages/sim/simPreview.js?v=${VERSION}`),
    render: ({ module, refs }) => module.renderSimPreview(refs.appContent)
  },
  "#/sim-dettaglio": {
    loadingLabel: "Gestione SIM",
    load: () => import(`../pages/sim/simList.js?v=${VERSION}`),
    render: ({ module, refs, params }) => module.renderSimList(refs.appContent, params)
  },
  "#/sim-configura": {
    loadingLabel: "Configura SIM",
    load: () => import(`../pages/sim/simConfigurePage.js?v=${VERSION}`),
    render: ({ module, refs, params }) => module.renderSimConfigurePage(refs.appContent, params)
  },
  "#/telefonate": {
    loadingLabel: "Telefonate",
    load: () => import(`../pages/calls/callsPreview.js?v=${VERSION}`),
    render: ({ module, refs, params }) => module.renderCallsPreview(refs.appContent, params)
  },
  "#/telefonate-dettaglio": {
    loadingLabel: "Telefonate",
    load: () => import(`../pages/calls/callsList.js?v=${VERSION}`),
    render: ({ module, refs, params }) => module.renderCallsList(refs.appContent, params)
  }
};

async function renderRoute(refs, path, params) {
  const route = ROUTES[path];

  if (!route) {
    window.location.hash = "#/dashboard";
    return;
  }

  showLoading(refs.appContent, route.loadingLabel);
  const module = await route.load();
  route.render({ module, refs, params });
}

export async function router(refs) {
  const { path, params } = getRouteData();

  setLayout(refs, path);

  try {
    await renderRoute(refs, path, params);
  } catch (error) {
    console.error("Router error:", error);
    refs.appContent.innerHTML = `
      <h2>Errore</h2>
      <p>Errore nel caricamento della sezione richiesta.</p>
    `;
  }
}
