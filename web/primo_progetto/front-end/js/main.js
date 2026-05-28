import { renderDashboard } from "./pages/dashboard.js?v=rmk-calls-pagination-v1";
import { renderContractsPreview } from "./pages/contracts/contractsPreview.js?v=rmk-calls-pagination-v1";
import { renderContractsList } from "./pages/contracts/contractsList.js?v=rmk-calls-pagination-v1";
import { renderContractDetail } from "./pages/contracts/contractDetail.js?v=rmk-calls-pagination-v1";
import { renderSimPreview } from "./pages/sim/simPreview.js?v=rmk-sim-responsive-v2";
import { renderSimList } from "./pages/sim/simList.js?v=rmk-sim-responsive-v2";

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

function renderBackNavigation() {
  if (!navCard) {
    return;
  }

  navCard.classList.add("dashboard-nav-card-back");
  navCard.innerHTML = `
    <a class="dashboard-back-link" href="#/dashboard">← Torna alla home</a>
  `;
}

function setLayout(path) {
  const isDashboard = path === "#/dashboard";
  const isDetailPage = path === "#/contratti-dettaglio" || path === "#/contratto" || path === "#/sim-dettaglio";

  if (filterCard) {
    filterCard.hidden = isDashboard || path === "#/contratto" || path === "#/sim" || path === "#/sim-dettaglio";
  }

  if (dashboardTop) {
    dashboardTop.classList.toggle("dashboard-top-detail", isDetailPage);
  }

  if (isDetailPage) {
    renderBackNavigation();
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

function router() {
  const { path, params } = getRouteData();

  setLayout(path);

  if (path === "#/dashboard") {
    renderDashboard(appContent);
    return;
  }

  if (path === "#/contratti") {
    renderContractsPreview(appContent, getFilters());
    return;
  }

  if (path === "#/contratti-dettaglio") {
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
    renderContractDetail(appContent, params.get("numero"));
    return;
  }

  if (path === "#/sim") {
    renderSimPreview(appContent);
    return;
  }

  if (path === "#/sim-dettaglio") {
    renderSimList(appContent, params);
    return;
  }

  if (path === "#/telefonate") {
    appContent.innerHTML = `
      <h2>Telefonate</h2>
      <p>Sezione in fase di sviluppo.</p>
    `;
    return;
  }

  window.location.hash = "#/dashboard";
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
