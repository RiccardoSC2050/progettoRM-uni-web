# Audit struttura prodotto

## Linguaggi e tecnologie rilevate

- HTML: presente in `index.html`.
- CSS: presente in `front-end/css/`.
- JavaScript ES Modules: presente in `front-end/js/`.
- AJAX / richieste asincrone: presente tramite `fetch()` in `front-end/js/api/httpClient.js`.
- PHP: presente nel back-end, nelle API, nei service, nei repository, nel core e nella configurazione.
- SQL: presente in `database/schema.sql`.
- Markdown: presente nella documentazione in `docs/` e nei README.
- Immagini: presente `front-end/image/logo.png`.

## Tecnologie non rilevate come codice applicativo

- XML: non risultano file `.xml` né gestione XML applicativa.
- jQuery AJAX: non rilevato; le chiamate asincrone sono gestite con `fetch()` nativo.

## Intervento organizzativo applicato

Il file `front-end/js/main.js` era corretto ma concentrava avvio applicazione, routing, caricamento schermate e gestione filtri globali.
Per aumentare scalabilità e leggibilità, senza modificare la logica, è stato diviso in moduli dedicati:

- `front-end/js/main.js`: bootstrap dell'applicazione.
- `front-end/js/app/router.js`: routing e caricamento delle sezioni.
- `front-end/js/app/globalFilters.js`: gestione submit/reset dei filtri globali.
- `front-end/js/app/loading.js`: rendering dello stato di caricamento.

## Controlli eseguiti

- Controllo percorsi import JavaScript.
- Controllo import CSS.
- Controllo asset HTML.
- Controllo `require_once` PHP.
- PHP lint su tutti i file `.php`.
- Syntax check JavaScript sui moduli modificati.

## Regola rispettata

Non sono state modificate logiche applicative, contenuti, query, validazioni, API, dati, layout visivo o comportamento funzionale.
L'intervento è limitato all'organizzazione del codice e alla separazione delle responsabilità.
