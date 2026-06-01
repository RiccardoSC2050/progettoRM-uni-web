import { escapeHtml } from "./simFormatters.js?v=rmk-sim-db-v1";

const GUIDE_STEPS = [
  {
    title: "Creare una SIM",
    text: "La creazione registra solo codice e tipo. La SIM nasce non attiva, quindi senza contratto e senza date."
  },
  {
    title: "Attivare una SIM",
    text: "Premi Attiva e scegli un contratto suggerito. La data di attivazione viene impostata automaticamente a oggi dal backend."
  },
  {
    title: "Contratti suggeriti",
    text: "Nel campo contratto vengono suggeriti solo numeri che non hanno già una SIM attiva collegata."
  },
  {
    title: "Modificare una SIM attiva",
    text: "Puoi cambiare codice e tipo. Il contratto resta bloccato: per cambiarlo devi disattivare e poi riattivare la SIM."
  },
  {
    title: "Disattivare una SIM attiva",
    text: "Premi Disattiva: la SIM passa nello storico disattivate. Il sistema usa la data di oggi come data di disattivazione effettiva."
  },
  {
    title: "Eliminare una SIM",
    text: "L'eliminazione resta disponibile solo per SIM presenti nello storico disattivate. Le SIM non attive restano registrate e possono essere attivate."
  }
];

export function renderSimGuideTrigger() {
  return `
    <button class="sim-btn sim-btn-secondary sim-guide-trigger" type="button" data-sim-guide>
      Guida rapida SIM
    </button>
  `;
}

function renderSimGuideModal() {
  return `
    <div class="sim-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="sim-guide-title">
      <div class="sim-modal sim-guide-modal">
        <button class="sim-modal-close" type="button" aria-label="Chiudi">×</button>
        <section class="sim-guide-content">
          <div class="sim-section-heading">
            <h3 id="sim-guide-title">Come gestire le SIM</h3>
            <p>Il flusso rispetta le tre tabelle del database: simnonattiva, simattiva e simdisattiva.</p>
          </div>

          <div class="sim-guide-steps">
            ${GUIDE_STEPS.map((step, index) => `
              <article class="sim-guide-step">
                <span>${index + 1}</span>
                <div>
                  <strong>${escapeHtml(step.title)}</strong>
                  <p>${escapeHtml(step.text)}</p>
                </div>
              </article>
            `).join("")}
          </div>

          <div class="sim-guide-note">
            Nota logica: le date non sono input dell’utente. La dataAttivazione viene registrata automaticamente quando la SIM viene collegata a un contratto; la dataDisattivazione viene registrata automaticamente solo quando la SIM viene effettivamente disattivata.
          </div>
        </section>
      </div>
    </div>
  `;
}

export function bindSimGuide(container) {
  container.querySelector("[data-sim-guide]")?.addEventListener("click", () => {
    document.querySelector(".sim-modal-backdrop")?.remove();
    document.body.insertAdjacentHTML("beforeend", renderSimGuideModal());

    const modal = document.querySelector(".sim-modal-backdrop");

    modal?.querySelector(".sim-modal-close")?.addEventListener("click", () => modal.remove());
    modal?.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  });
}
