# Relazione progetto RK/MK

## 1. Introduzione

RK/MK è un'applicazione web didattica sviluppata per il progetto di Programmazione Web sul dominio dei contratti telefonici.

L'applicazione permette di consultare dati relativi a contratti, telefonate e SIM, con una gestione dedicata all’intero ciclo delle SIM: non attive, attive e disattivate. Il lavoro è stato orientato a costruire un'interfaccia leggibile, responsive e coerente, mantenendo una separazione ordinata tra front-end, back-end e database.

## 2. Obiettivo del progetto

L'obiettivo principale è realizzare una web application capace di:

- mostrare informazioni sintetiche tramite dashboard;
- consultare contratti telefonici;
- approfondire i dati di un singolo contratto;
- visualizzare e filtrare telefonate;
- gestire le SIM su tutte le condizioni operative: creazione, consultazione, modifica delle SIM attive/non attive, disattivazione ed eliminazione delle SIM disattivate;
- mantenere un collegamento chiaro tra interfaccia, API PHP e database MySQL.

Il progetto non prevede autenticazione, perché l'applicazione è stata pensata per un unico tipo di utente, come richiesto dalle indicazioni progettuali.

## 3. Tecnologie utilizzate

```text
HTML       → struttura della pagina
CSS        → layout, componenti, responsive design e stile grafico
JavaScript → gestione dinamica del front-end e chiamate API
PHP        → endpoint, logica applicativa e accesso al database
MySQL      → memorizzazione dei dati
GitHub     → versionamento e lavoro condiviso
```

## 4. Struttura generale

Il progetto è stato organizzato in cartelle con responsabilità distinte.

```text
front-end/   → interfaccia, stile e logica lato client
back-end/    → API, servizi, repository e configurazione database
database/    → schema SQL e istruzioni per il database
docs/        → documentazione tecnica e relazione progettuale
```

Questa divisione permette di evitare l'accumulo di codice in pochi file e rende più semplice modificare il progetto senza danneggiare parti non coinvolte.

## 5. Front-end

Il front-end è composto da HTML, CSS e JavaScript modulare.

La pagina principale è `index.html`, mentre la logica dinamica è distribuita nella cartella `front-end/js/`.

Le sezioni principali sono:

- dashboard;
- contratti;
- dettaglio contratto;
- telefonate;
- gestione SIM.

Il CSS è stato diviso per base, variabili e layout, con file specifici per header, footer, dashboard, contratti, telefonate e SIM. Questa scelta permette di intervenire su un'area del sito senza modificare globalmente l'interfaccia.

## 6. Back-end

Il back-end è organizzato in quattro livelli:

```text
api/          → riceve le richieste HTTP e restituisce JSON
services/     → contiene la logica applicativa
repositories/ → contiene le query SQL
core/         → contiene funzioni comuni per request, response e validazione
```

Il flusso corretto è:

```text
JavaScript front-end
→ endpoint PHP
→ service PHP
→ repository PHP
→ database MySQL
→ risposta JSON
→ rendering nel front-end
```

Questa struttura valorizza il collegamento tra front-end e back-end perché ogni livello ha un ruolo chiaro.

## 7. Database

Il database è basato sulle entità principali del dominio telefonico:

- `contrattotelefonico`;
- `telefonata`;
- `simattiva`;
- `simdisattiva`;
- `simnonattiva`.

La cartella `database/` contiene lo schema SQL di riferimento e le istruzioni per ricreare la struttura dati.

## 8. CRUD SIM

La gestione SIM lavora sull’insieme delle tabelle `simattiva`, `simdisattiva` e `simnonattiva`.

L'utente può:

- visualizzare tutte le SIM;
- filtrare l'elenco per codice, contratto, tipo, stato e data di disattivazione;
- creare una nuova SIM;
- modificare le SIM attive o non attive;
- attivare SIM non attive o disattivate collegandole a un contratto e indicando la data di attivazione;
- disattivare una SIM attiva spostandola subito nello storico `simdisattiva` con data di disattivazione odierna;
- eliminare solo le SIM disattivate.

La sezione è stata curata sia dal punto di vista funzionale sia dal punto di vista dell'esperienza utente, con controlli sui dati, suggerimenti nei form e coerenza con lo schema originale del database.

## 9. UI, UX e responsive design

L'interfaccia è stata progettata per essere chiara, coerente e utilizzabile su desktop, tablet e smartphone.

Sono stati curati:

- proporzioni dei contenitori;
- leggibilità delle card;
- ridimensionamento mobile;
- centratura dell'header;
- tabelle adattate a schermi piccoli;
- paginazione mobile più compatta;
- distribuzione dei dati nei riquadri;
- coerenza visiva tra dashboard, contratti, telefonate e SIM.

La revisione UI/UX è stata costante durante il lavoro, con più cicli di controllo e correzione.

## 10. Metodo di lavoro

Il lavoro è stato distribuito nel tempo tramite confronto continuo tra i componenti del gruppo.

Sono stati utilizzati:

- call di coordinamento per decidere modifiche e priorità;
- GitHub per condividere codice, controllare versioni e lavorare in coppia;
- revisioni progressive dell'interfaccia e della struttura;
- supporto dell'AI per analizzare il codice, proporre refactoring, scrivere CSS più coerente e migliorare UI/UX.

L'AI è stata utilizzata come supporto tecnico e di revisione, non come sostituzione del controllo progettuale. Le decisioni finali sono state guidate dagli obiettivi del progetto e dalla verifica del funzionamento reale dell'applicazione.

## 11. Uso dell'AI

L'AI ha supportato il lavoro in particolare su:

- analisi della struttura del progetto;
- individuazione di file troppo carichi;
- separazione più ordinata tra front-end e back-end;
- scrittura e revisione del CSS responsive;
- miglioramento della leggibilità UI/UX;
- controllo del dialogo tra JavaScript, PHP e database;
- proposta di documentazione tecnica;
- revisione finale di coerenza.

Il supporto è stato usato in modo iterativo: ogni modifica è stata valutata rispetto al comportamento già presente, evitando di riscrivere parti non richieste.

## 12. Conclusione

Il progetto finale presenta una struttura ordinata, una separazione chiara tra le responsabilità dei file e un'interfaccia curata per diversi dispositivi.

Il lavoro non si è limitato alla realizzazione funzionale, ma ha incluso una revisione continua dell'organizzazione del codice, del collegamento tra front-end e back-end e dell'esperienza utente.
