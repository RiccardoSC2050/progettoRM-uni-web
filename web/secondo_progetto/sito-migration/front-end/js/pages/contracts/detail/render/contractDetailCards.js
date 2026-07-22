import { escapeHtml } from "../../../../utils/escapeHtml.js?v=rmk-sim-db-v5";
import {
  formatContractType,
  formatContractValue,
  formatCurrency,
  formatDate,
  formatNumber,
  formatCallMinutes
} from "../../contractsFormatters.js?v=rmk-sim-db-v5";

export function renderContractCards(contract) {
  const simLabel = contract.tipoSIM ? escapeHtml(contract.tipoSIM) : "Nessuna SIM attiva";
  const isRicarica = contract.tipo === "ricarica";
  const valueLabel = isRicarica ? "Credito residuo utente" : "Minuti consumati";
  const costLabel = isRicarica ? "Costo totale utente" : "Costo totale azienda";

  return `
    <section class="contract-detail-summary">
      <article>
        <span>Tipo contratto</span>
        <strong>${formatContractType(contract.tipo)}</strong>
      </article>

      <article>
        <span>Data attivazione</span>
        <strong>${formatDate(contract.dataAttivazione)}</strong>
      </article>

      <article>
        <span>${valueLabel}</span>
        <strong>${formatContractValue(contract)}</strong>
      </article>

      <article>
        <span>SIM associata</span>
        <strong>${simLabel}</strong>
      </article>

      <article>
        <span>Telefonate</span>
        <strong>${formatNumber(contract.numeroTelefonate)}</strong>
      </article>

      <article>
        <span>Minutaggio totale</span>
        <strong>${formatCallMinutes(contract.durataTotale)}</strong>
      </article>

      <article>
        <span>${costLabel}</span>
        <strong>${formatCurrency(contract.costoTotale)}</strong>
      </article>
    </section>
  `;
}
