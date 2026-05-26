import { renderDashboard } from "./pages/dashboard.js";

const appContent = document.querySelector("#app-content");

function router() {
  const route = window.location.hash;

  if (route === "#/dashboard") {
    renderDashboard(appContent);
    return;
  }

  appContent.innerHTML = "";
}

window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);
