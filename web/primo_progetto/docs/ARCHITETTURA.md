# Architettura del progetto

## 1. Obiettivo architetturale

L'architettura del progetto è stata costruita per separare chiaramente interfaccia, logica client, API, logica applicativa, accesso ai dati e database.

Il principio seguito è:

```text
ogni file deve avere una responsabilità chiara
```

Il progetto evita di concentrare troppe funzioni in un unico punto e cerca di rendere leggibile il collegamento tra le parti.

## 2. Struttura generale

```text
.
├── index.html
├── front-end/
│   ├── css/
│   ├── js/
│   └── image/
├── back-end/
│   ├── api/
│   ├── config/
│   ├── core/
│   ├── repositories/
│   └── services/
├── database/
└── docs/
```

## 3. Flusso applicativo

Il flusso principale dell'applicazione è:

```text
index.html
→ front-end/js/main.js
→ modulo pagina
→ modulo API front-end
→ endpoint PHP
→ service PHP
→ repository PHP
→ database MySQL
→ risposta JSON
→ rendering front-end
```

Questa struttura rende chiaro quale parte del progetto si occupa di ciascun passaggio.

## 4. Front-end

```text
front-end/
├── css/
│   ├── base/
│   ├── layout/
│   └── variables/
├── js/
│   ├── api/
│   ├── app/
│   ├── pages/
│   └── utils/
└── image/
```

### 4.1 CSS

Il CSS è diviso in:

- `base/` per regole generali e responsive di base;
- `variables/` per colori, spaziature, font ed effetti condivisi;
- `layout/` per sezioni specifiche dell'interfaccia.

La cartella `layout/` contiene file dedicati a:

- header;
- footer;
- dashboard;
- contratti;
- telefonate;
- SIM;
- contenitore generale del sito.

Questa divisione rende più semplice modificare una sezione senza alterare l'intero progetto.

### 4.2 JavaScript applicativo

```text
front-end/js/app/
├── domRefs.js
├── filters.js
├── navigation.js
├── routeState.js
└── version.js
```

Questi file gestiscono elementi comuni dell'applicazione:

- riferimenti DOM principali;
- lettura dei filtri globali;
- navigazione;
- stato della rotta hash;
- versione cache dei moduli.

### 4.3 JavaScript API

```text
front-end/js/api/
├── callsApi.js
├── contractsApi.js
├── dashboardApi.js
├── endpoints.js
├── httpClient.js
└── simApi.js
```

La cartella `api/` contiene solo il dialogo con il back-end.

- `endpoints.js` centralizza i percorsi PHP;
- `httpClient.js` centralizza `fetch`, JSON ed errori;
- i file specifici espongono funzioni per contratti, telefonate, dashboard e SIM.

Le pagine non dovrebbero chiamare direttamente percorsi PHP: devono passare dai moduli API.

### 4.4 Pagine front-end

```text
front-end/js/pages/
├── calls/
├── contracts/
├── sim/
└── dashboard.js
```

Ogni cartella contiene i moduli relativi a una sezione dell'applicazione.

Esempi:

- `contracts/` gestisce lista, preview, tabella, ordinamento, riepilogo e dettaglio contratto;
- `calls/` gestisce telefonate, grafico, filtri, riepilogo e tabella;
- `sim/` gestisce preview, lista, form, modale, validazione e tabella.

## 5. Back-end

```text
back-end/
├── api/
├── config/
├── core/
├── repositories/
└── services/
```

### 5.1 API

```text
back-end/api/
├── contracts/
├── dashboard/
├── sim/
└── telefonate/
```

Gli endpoint ricevono la richiesta HTTP, richiamano il service corretto e restituiscono una risposta JSON.

### 5.2 Services

```text
back-end/services/
```

I service contengono la logica applicativa. Sono il punto intermedio tra endpoint e repository.

Esempio:

```text
endpoint SIM
→ simService.php
→ repositories/sim/
```

### 5.3 Repositories

```text
back-end/repositories/
```

I repository contengono le query SQL. Questo permette di non mischiare codice HTTP e SQL nello stesso file.

Per la Gestione SIM, il repository è diviso in moduli mirati:

```text
back-end/repositories/sim/
├── simLookupRepository.php
├── simQueryHelpers.php
├── simReadRepository.php
└── simWriteRepository.php
```

- `simReadRepository.php` legge lista, filtri e riepilogo;
- `simWriteRepository.php` gestisce inserimenti, spostamenti di stato ed eliminazioni;
- `simLookupRepository.php` controlla contratti disponibili e codici duplicati;
- `simQueryHelpers.php` contiene costruzione della UNION e filtri comuni.

### 5.4 Core

```text
back-end/core/
├── request.php
├── response.php
└── validation.php
```

I file core contengono funzioni condivise:

- lettura delle richieste;
- risposte JSON uniformi;
- normalizzazione dei parametri.

### 5.5 Configurazione

```text
back-end/config/
├── database.php
```

La connessione al database è centralizzata. È possibile creare un file locale non versionato per differenziare ambiente locale e hosting.

## 6. Database

La cartella `database/` contiene:

```text
database/
├── README.md
└── schema.sql
```

Lo schema rende esplicite le tabelle usate dall'applicazione e permette di ricreare la struttura dati. La Gestione SIM rispetta le tre tabelle originali: `simnonattiva`, `simattiva` e `simdisattiva`. La scadenza futura non è memorizzabile nello schema attuale: `simattiva` non contiene una colonna dedicata. La `dataDisattivazione` viene salvata solo nello storico `simdisattiva`.

## 7. Documentazione

La cartella `docs/` contiene la documentazione finale del progetto:

```text
docs/
├── README.md
├── RELAZIONE_PROGETTO.md
├── ARCHITETTURA.md
├── UI_UX_E_RESPONSIVE.md
├── TEST_E_REVISIONE.md
└── REQUISITI.md
```

## 8. Criterio di manutenzione

La regola da seguire per modifiche future è:

```text
non modificare file generali se la modifica riguarda una sezione specifica
```

Esempi:

- una modifica ai contratti va in `contracts/`;
- una modifica alle SIM va in `sim/`;
- una modifica al dialogo API va in `front-end/js/api/` o `back-end/api/`;
- una modifica al database va documentata in `database/`.

Questo mantiene il progetto coerente e più semplice da mantenere nel tempo.
