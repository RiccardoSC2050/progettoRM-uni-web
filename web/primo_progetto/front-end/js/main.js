const VERSION = "rmk-contracts-mobile-fix-v1";

const appContent = document.querySelector("#app-content");
const dashboardTop = document.querySelector(".dashboard-top");
const navCard = document.querySelector(".dashboard-nav-card");
const filterCard = document.querySelector(".dashboard-filter-card");
const filterForm = document.querySelector(".dashboard-filter-form");
const filterText = document.querySelector("#filtro-testo");
const filterType = document.querySelector("#filtro-tipo");
const filterDate = document.querySelector("#filtro-data");

function getRouteData() {
  const hash = window.location.hash || "#/dashboard";
  const [path, queryString = ""] = hash.split("?");

  return {
    path,
    params: new URLSearchParams(queryString)
  };
}

function getFilters() {
  return {
    q: filterText?.value.trim() || "",
    tipo: filterType?.value || "",
    data: filterDate?.value || ""
  };
}

function renderDefaultNavigation() {
  if (!navCard) {
    return;
  }

  navCard.classList.remove("dashboard-nav-card-back");
  navCard.innerHTML = `
    <h2>Navigazione</h2>

    <nav class="dashboard-nav">
      <ul>
        <li><a href="#/dashboard">Dashboard</a></li>
        <li><a href="#/contratti">Contratti</a></li>
        <li><a href="#/sim">Gestione SIM</a></li>
        <li><a href="#/telefonate">Telefonate</a></li>
      </ul>
    </nav>
  `;
}

function getBackRoute(path) {
  const backRoutes = {
    "#/contratti-dettaglio": "#/contratti",
    "#/contratto": "#/contratti",
    "#/sim-dettaglio": "#/sim",
    "#/telefonate-dettaglio": "#/telefonate"
  };

  return backRoutes[path] || "#/dashboard";
}

function getBackLabel(path) {
  const labels = {
    "#/contratti-dettaglio": "← Torna a contratti",
    "#/contratto": "← Torna a contratti",
    "#/sim-dettaglio": "← Torna a gestione SIM",
    "#/telefonate-dettaglio": "← Torna a telefonate"
  };

  return labels[path] || "← Torna alla home";
}

function renderBackNavigation(path) {
  if (!navCard) {
    return;
  }

  navCard.classList.add("dashboard-nav-card-back");
  navCard.innerHTML = `
    <a class="dashboard-back-link" href="${getBackRoute(path)}">${getBackLabel(path)}</a>
  `;
}

function setLayout(path) {
  const isDashboard = path === "#/dashboard";
  const isDetailPage =
    path === "#/contratti-dettaglio" ||
    path === "#/contratto" ||
    path === "#/sim-dettaglio" ||
    path === "#/telefonate-dettaglio";

  if (filterCard) {
    filterCard.hidden =
      isDashboard ||
      path === "#/contratto" ||
      path === "#/sim" ||
      path === "#/sim-dettaglio" ||
      path === "#/telefonate" ||
      path === "#/telefonate-dettaglio";
  }

  if (dashboardTop) {
    dashboardTop.classList.toggle("dashboard-top-detail", isDetailPage);
  }

  if (isDetailPage) {
    renderBackNavigation(path);
    return;
  }

  renderDefaultNavigation();
}

function setContractsDetailPage(page, sort = "dataAttivazione", direction = "desc") {
  const params = new URLSearchParams({ page, sort, direction });
  const nextHash = `#/contratti-dettaglio?${params.toString()}`;

  if (window.location.hash === nextHash) {
    router();
    return;
  }

  window.location.hash = nextHash;
}

function showLoading(title) {
  appContent.innerHTML = `
    <h2>${title}</h2>
    <p>Caricamento...</p>
  `;
}

async function router() {
  const { path, params } = getRouteData();

  setLayout(path);

  try {
    if (path === "#/dashboard") {
      showLoading("Dashboard");
      const { renderDashboard } = await import(`./pages/dashboard.js?v=${VERSION}`);
      renderDashboard(appContent);
      return;
    }

    if (path === "#/contratti") {
      showLoading("Contratti");
      const { renderContractsPreview } = await import(`./pages/contracts/contractsPreview.js?v=${VERSION}`);
      renderContractsPreview(appContent, getFilters());
      return;
    }

    if (path === "#/contratti-dettaglio") {
      showLoading("Contratti");
      const { renderContractsList } = await import(`./pages/contracts/contractsList.js?v=${VERSION}`);
      renderContractsList(
        appContent,
        getFilters(),
        params.get("page"),
        params.get("sort") || "dataAttivazione",
        params.get("direction") || "desc"
      );
      return;
    }

    if (path === "#/contratto") {
      showLoading("Dettaglio contratto");
      const { renderContractDetail } = await import(`./pages/contracts/contractDetail.js?v=${VERSION}`);
      renderContractDetail(appContent, params.get("numero"));
      return;
    }

    if (path === "#/sim") {
      showLoading("Gestione SIM");
      const { renderSimPreview } = await import(`./pages/sim/simPreview.js?v=${VERSION}`);
      renderSimPreview(appContent);
      return;
    }

    if (path === "#/sim-dettaglio") {
      showLoading("Gestione SIM");
      const { renderSimList } = await import(`./pages/sim/simList.js?v=${VERSION}`);
      renderSimList(appContent, params);
      return;
    }

    if (path === "#/telefonate") {
      showLoading("Telefonate");
      const { renderCallsPreview } = await import(`./pages/calls/callsPreview.js?v=${VERSION}`);
      renderCallsPreview(appContent, params);
      return;
    }

    if (path === "#/telefonate-dettaglio") {
      showLoading("Telefonate");
      const { renderCallsList } = await import(`./pages/calls/callsList.js?v=${VERSION}`);
      renderCallsList(appContent, params);
      return;
    }

    window.location.hash = "#/dashboard";
  } catch (error) {
    appContent.innerHTML = `
      <h2>Errore</h2>
      <p>Errore nel caricamento della sezione richiesta.</p>
    `;
  }
}

if (filterForm) {
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const { path, params } = getRouteData();

    if (path === "#/contratti-dettaglio") {
      setContractsDetailPage(1, params.get("sort") || "dataAttivazione", params.get("direction") || "desc");
      return;
    }

    router();
  });

  filterForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      const { path, params } = getRouteData();

      if (path === "#/contratti-dettaglio") {
        setContractsDetailPage(1, params.get("sort") || "dataAttivazione", params.get("direction") || "desc");
        return;
      }

      router();
    }, 0);
  });
}

window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);
