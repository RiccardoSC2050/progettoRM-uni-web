# Modifiche mirate: Contratti e configurazione SIM

## Regola rispettata
Sono state modificate solo le due aree richieste:

1. visualizzazione minutaggi nella sezione Contratti;
2. configurazione dedicata della SIM appena creata.

Non sono state modificate query funzionali, flussi di business, struttura dati, contenuti generali o comportamento delle altre sezioni.

## Contratti: minutaggi telefonate

### Problema
Nella lista contratti veniva mostrato il numero delle telefonate, ma non il minutaggio complessivo prodotto da quelle telefonate.

### Intervento
È stata aggiunta alla risposta dei contratti la durata totale delle telefonate associate al contratto.

File interessati:

- `back-end/repositories/contracts/contractsListRepository.php`
- `front-end/js/pages/contracts/contractsDurationFormatters.js`
- `front-end/js/pages/contracts/contractsTable.js`
- `front-end/js/pages/contracts/detail/render/contractDetailCards.js`
- `front-end/css/layout/contracts/contracts-table.css`

### Risultato
Nella tabella contratti la colonna Telefonate mostra ora:

- numero telefonate;
- minutaggio totale sotto al numero.

Nel dettaglio contratto è stata aggiunta la card `Minutaggio totale`.

## SIM: configurazione dedicata dopo la creazione

### Problema
Dopo la creazione di una nuova SIM, scegliendo `Configura ora`, la configurazione veniva aperta nel contesto della pagina completa di gestione SIM, con troppi elementi intorno.

### Intervento
È stata introdotta una pagina dedicata alla sola configurazione della SIM appena creata.

File interessati:

- `front-end/js/pages/sim/simConfigurePage.js`
- `front-end/js/pages/sim/simListEvents.js`
- `front-end/js/pages/sim/simPostCreate.js`
- `front-end/js/app/router.js`

### Risultato
Dopo `Configura ora`, l'utente viene portato su:

`#/sim-configura?codice=...&tipoSIM=...`

La pagina mostra solo:

- header essenziale;
- pulsante per tornare alle SIM;
- form di configurazione già esistente;
- stessa logica di attivazione già usata prima.

## Controlli finali

- PHP lint: OK
- JavaScript syntax check: OK
- import JavaScript locali: OK
