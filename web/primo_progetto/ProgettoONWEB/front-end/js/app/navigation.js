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

function renderDefaultNavigation(navCard) {
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

function renderBackNavigation(navCard, path) {
  if (!navCard) {
    return;
  }

  navCard.classList.add("dashboard-nav-card-back");
  navCard.innerHTML = `
    <a class="dashboard-back-link" href="${getBackRoute(path)}">${getBackLabel(path)}</a>
  `;
}

export function setLayout(refs, path) {
  const isDashboard = path === "#/dashboard";
  const isDetailPage =
    path === "#/contratti-dettaglio" ||
    path === "#/contratto" ||
    path === "#/sim-dettaglio" ||
    path === "#/telefonate-dettaglio";

  if (refs.filterCard) {
    refs.filterCard.hidden =
      isDashboard ||
      path === "#/contratto" ||
      path === "#/sim" ||
      path === "#/sim-dettaglio" ||
      path === "#/telefonate" ||
      path === "#/telefonate-dettaglio";
  }

  if (refs.dashboardTop) {
    refs.dashboardTop.classList.toggle("dashboard-top-detail", isDetailPage);
  }

  if (isDetailPage) {
    renderBackNavigation(refs.navCard, path);
    return;
  }

  renderDefaultNavigation(refs.navCard);
}
