import { renderSimGuideModal, renderSimGuideTrigger } from "./simGuideTemplate.js?v=rmk-sim-db-v5";

function closeSimGuide(modal, onKeyDown) {
  modal?.remove();
  document.removeEventListener("keydown", onKeyDown);
}

function openSimGuide() {
  document.querySelector(".sim-guide-backdrop")?.remove();
  document.body.insertAdjacentHTML("beforeend", renderSimGuideModal());

  const modal = document.querySelector(".sim-guide-backdrop");
  if (!modal) {
    return;
  }

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      closeSimGuide(modal, onKeyDown);
    }
  };

  modal.querySelector(".sim-modal-close")?.addEventListener("click", () => closeSimGuide(modal, onKeyDown));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeSimGuide(modal, onKeyDown);
    }
  });
  document.addEventListener("keydown", onKeyDown);
}

export { renderSimGuideTrigger };

export function bindSimGuide(container) {
  container.querySelector("[data-sim-guide]")?.addEventListener("click", openSimGuide);
}
