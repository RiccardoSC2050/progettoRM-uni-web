export const SIM_GUIDE_STEPS = [
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

export const SIM_GUIDE_NOTE = "Nota logica: le date non sono input dell’utente. La dataAttivazione viene registrata automaticamente quando la SIM viene collegata a un contratto; la dataDisattivazione viene registrata automaticamente solo quando la SIM viene effettivamente disattivata.";
