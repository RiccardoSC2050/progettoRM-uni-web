export function getAppDomRefs() {
  return {
    appContent: document.querySelector("#app-content"),
    dashboardTop: document.querySelector(".dashboard-top"),
    navCard: document.querySelector(".dashboard-nav-card"),
    filterCard: document.querySelector(".dashboard-filter-card"),
    filterForm: document.querySelector(".dashboard-filter-form"),
    filterText: document.querySelector("#filtro-testo"),
    filterType: document.querySelector("#filtro-tipo"),
    filterDate: document.querySelector("#filtro-data")
  };
}
