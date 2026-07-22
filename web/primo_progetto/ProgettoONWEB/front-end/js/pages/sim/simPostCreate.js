import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";

export function showSimPostCreateActions(form, simData, onStay = null, onConfigure = null) {
  const box = form.querySelector("[data-sim-form-message]");

  if (!box) {
    return;
  }

  const codice = simData.codice || "";
  box.dataset.visible = "true";
  box.className = "sim-form-message sim-form-message-info";
  box.innerHTML = `
    <strong>SIM creata correttamente.</strong>
    <p>Ora puoi lasciarla senza contratto oppure attivarla scegliendo un contratto libero.</p>
    <div class="sim-form-message-actions">
      <button class="sim-btn sim-btn-primary" type="button" data-configure-created-sim>Configura ora</button>
      <button class="sim-btn sim-btn-secondary" type="button" data-keep-created-sim>Lascia senza contratto</button>
    </div>
  `;

  box.querySelector("[data-configure-created-sim]")?.addEventListener("click", () => {
    if (typeof onConfigure === "function") {
      onConfigure({
        codice,
        tipoSIM: simData.tipoSIM || "standard",
        stato: "non_attiva",
        contratto: "",
        dataAttivazione: "",
        dataDisattivazione: ""
      });
      return;
    }

    window.location.hash = `#/sim-configura?codice=${encodeURIComponent(codice)}&tipoSIM=${encodeURIComponent(simData.tipoSIM || "standard")}`;
  });

  box.querySelector("[data-keep-created-sim]")?.addEventListener("click", () => {
    if (typeof onStay === "function") {
      onStay();
      return;
    }

    form.reset();
  });
}
