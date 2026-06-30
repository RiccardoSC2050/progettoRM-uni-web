import { escapeHtml } from "../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import { SIM_GUIDE_NOTE, SIM_GUIDE_STEPS } from "./simGuideData.js?v=rmk-sim-db-v5";

export function renderSimGuideTrigger() {
  return `
    <button class="sim-btn sim-btn-secondary sim-guide-trigger" type="button" data-sim-guide>
      Guida rapida SIM
    </button>
  `;
}

function renderSimGuideStep(step, index) {
  return `
    <article class="sim-guide-step">
      <span class="sim-guide-step-number" aria-hidden="true">${index + 1}</span>
      <div class="sim-guide-step-copy">
        <strong>${escapeHtml(step.title)}</strong>
        <p>${escapeHtml(step.text)}</p>
      </div>
    </article>
  `;
}

export function renderSimGuideModal() {
  return `
    <div class="sim-modal-backdrop sim-guide-backdrop" role="dialog" aria-modal="true" aria-labelledby="sim-guide-title">
      <div class="sim-modal sim-guide-modal">
        <button class="sim-modal-close sim-guide-close" type="button" aria-label="Chiudi guida SIM">×</button>
        <section class="sim-guide-content">
          <header class="sim-guide-heading">
            <p class="sim-guide-eyebrow">Guida rapida</p>
            <h3 id="sim-guide-title">Come gestire le SIM</h3>
            <p>Il flusso rispetta le tre tabelle del database: simnonattiva, simattiva e simdisattiva.</p>
          </header>

          <div class="sim-guide-steps">
            ${SIM_GUIDE_STEPS.map(renderSimGuideStep).join("")}
          </div>

          <aside class="sim-guide-note">
            ${escapeHtml(SIM_GUIDE_NOTE)}
          </aside>
        </section>
      </div>
    </div>
  `;
}
