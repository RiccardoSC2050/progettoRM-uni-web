# 01 - Analisi del codice, procedura e organizzazione

## 1. Inquadramento del progetto

Il progetto è una web app sviluppata per il corso di Programmazione Web, basata sul database assegnato **Ex 2 - Telefoni**.

L'applicazione gestisce dati relativi a:

- contratti telefonici;
- SIM attive;
- SIM disattivate;
- SIM non attive;
- telefonate associate ai contratti.

La tabella principale oggetto di CRUD è **SIMDisattiva**. Il progetto è stato organizzato con separazione tra interfaccia utente, logica client, logica server e database.

---

## 2. Tecnologie utilizzate

Il progetto utilizza tecnologie standard per una web app PHP/MySQL:

| Ambito                      | Tecnologia       | Utilizzo                                                             |
| --------------------------- | ---------------- | -------------------------------------------------------------------- |
| Struttura pagina            | HTML             | Pagina principale dell'applicazione                                  |
| Stile grafico               | CSS              | Layout, palette, componenti e responsive design                      |
| Logica client               | JavaScript       | Navigazione, rendering dinamico, filtri, form e gestione interazioni |
| Comunicazione client/server | Fetch API / AJAX | Richieste asincrone verso il back-end                                |
| Back-end                    | PHP              | API, servizi applicativi, validazioni e accesso ai dati              |
| Database                    | SQL / MySQL      | Struttura dati e interrogazioni sulle tabelle del progetto           |
| Formato scambio dati        | JSON             | Comunicazione tra JavaScript e PHP                                   |

Il browser non accede direttamente al database. Le operazioni sui dati passano dal front-end JavaScript al back-end PHP, che esegue le query SQL e restituisce risposte JSON.

---

## 3. Struttura generale delle cartelle

La struttura principale del progetto è organizzata in aree funzionali:

```text
primo_progetto/
├── index.html
├── database/
├── docs/
├── front-end/
│   ├── css/
│   ├── image/
│   └── js/
└── back-end/
    ├── api/
    ├── config/
    ├── core/
    ├── repositories/
    └── services/
```

Questa suddivisione consente di distinguere chiaramente:

- la pagina di ingresso dell'applicazione;
- gli script SQL del database;
- la documentazione;
- il codice front-end;
- il codice back-end;
- le funzioni di accesso e gestione dei dati.

---

## 4. Entry point dell'applicazione

Il file principale è:

```text
index.html
```

Questo file contiene la struttura generale della web app: header, navigazione, area contenuti, filtro rapido e footer.

Il contenuto principale viene caricato dinamicamente all'interno dell'area centrale della pagina tramite JavaScript. In questo modo non sono state create molte pagine HTML separate, ma una singola interfaccia che cambia contenuto in base alla sezione selezionata.

---

## 5. Organizzazione del front-end

Il front-end è contenuto nella cartella:

```text
front-end/
```

È suddiviso in:

```text
front-end/css/
front-end/js/
front-end/image/
```

### CSS

La parte CSS è divisa in file dedicati a:

- variabili grafiche;
- layout generale;
- header e footer;
- dashboard;
- contratti;
- telefonate;
- gestione SIM;
- responsive design.

Il file principale di importazione è:

```text
front-end/css/import-css.css
```

Questa scelta permette di mantenere un solo collegamento CSS nell'HTML, ma con una struttura interna più ordinata e modificabile.

### JavaScript

La parte JavaScript è organizzata in moduli:

```text
front-end/js/api/
front-end/js/app/
front-end/js/pages/
front-end/js/utils/
```

La cartella `api` contiene le funzioni che comunicano con il back-end.

La cartella `app` gestisce navigazione, stato della pagina, filtri globali e caricamento.

La cartella `pages` contiene la logica delle sezioni principali:

- dashboard;
- contratti;
- telefonate;
- SIM.

La cartella `utils` contiene funzioni di supporto riutilizzabili.

---

## 6. Organizzazione del back-end

Il back-end è contenuto nella cartella:

```text
back-end/
```

È suddiviso in:

```text
back-end/api/
back-end/config/
back-end/core/
back-end/repositories/
back-end/services/
```

### API

La cartella `api` contiene gli endpoint PHP chiamati dal front-end. Gli endpoint sono divisi per area funzionale:

- `dashboard/` per i dati riepilogativi;
- `contracts/` per i contratti telefonici;
- `telefonate/` per le telefonate;
- `sim/` per le operazioni sulle SIM.

Gli endpoint ricevono le richieste, richiamano i servizi applicativi e restituiscono dati in formato JSON.

### Configurazione e core

La cartella `config` contiene la configurazione del database.

La cartella `core` contiene funzioni comuni, come:

- connessione al database;
- gestione delle richieste;
- gestione delle risposte JSON;
- validazione;
- controllo di integrità dei dati.

### Services

La cartella `services` contiene la logica applicativa. In questa sezione vengono gestite le regole principali del progetto, ad esempio la coerenza tra contratti, SIM attive e SIM disattivate.

### Repositories

La cartella `repositories` contiene le query SQL e l'accesso ai dati. Questa separazione evita di inserire query direttamente negli endpoint API e rende il codice più ordinato.

---

## 7. Gestione del database

Il database è definito nella cartella:

```text
database/
```

Il file principale è:

```text
database/schema.sql
```

Lo schema segue il database assegnato **Contratti Telefonici** e comprende le tabelle principali:

- `contrattotelefonico`;
- `simattiva`;
- `simdisattiva`;
- `simnonattiva`;
- `telefonata`.

Le query SQL vengono eseguite dal back-end PHP tramite repository dedicati. La logica applicativa gestisce la coerenza tra le associazioni dei contratti e lo stato delle SIM.

---

## 8. Separazione tra front-end e back-end

Il progetto mantiene una separazione tra front-end e back-end:

```text
HTML/CSS/JS → API PHP → Services → Repositories → Database MySQL
```

Il front-end si occupa di:

- visualizzare i dati;
- gestire i form;
- applicare filtri e ordinamenti;
- inviare richieste al server;
- aggiornare dinamicamente l'interfaccia.

Il back-end si occupa di:

- ricevere le richieste;
- validare i dati;
- applicare le regole del progetto;
- interrogare il database;
- restituire risposte JSON.

Questa struttura rende il progetto più leggibile e riduce l'accoppiamento tra interfaccia e gestione dei dati.

---

## 9. Gestione asincrona

Le operazioni di lettura e modifica dei dati vengono eseguite in modo asincrono tramite JavaScript.

Questo permette di aggiornare le sezioni della pagina senza ricaricare completamente il sito. Le chiamate asincrone sono utilizzate per:

- caricamento dashboard;
- ricerca contratti;
- visualizzazione telefonate;
- elenco SIM;
- creazione, modifica ed eliminazione di SIM disattivate;
- aggiornamento dei dati dopo operazioni CRUD.

---

## 10. Organizzazione della logica SIM

La gestione delle SIM è una delle parti principali del progetto.

Il codice è suddiviso tra:

- endpoint API per ricevere le richieste;
- servizi per applicare le regole operative;
- repository per leggere e scrivere nel database;
- moduli JavaScript per form, tabelle, filtri e modali.

La logica tiene conto dei diversi stati delle SIM:

- attiva;
- disattivata;
- non attiva.

Particolare attenzione è stata data alla coerenza tra il numero di contratto e le SIM associate, in modo da evitare associazioni duplicate o stati non coerenti.

---

## 11. Sintesi organizzativa

Il progetto è strutturato secondo una divisione a livelli:

```text
Interfaccia utente
↓
JavaScript front-end
↓
API PHP
↓
Servizi applicativi
↓
Repository SQL
↓
Database MySQL
```

Questa organizzazione consente di mantenere separati presentazione, logica applicativa e accesso ai dati.

La struttura risulta quindi adatta a una revisione generale del progetto, perché permette di individuare rapidamente:

- dove si trova l'interfaccia;
- dove si trova la logica client;
- dove si trovano le API PHP;
- dove vengono gestite le regole applicative;
- dove sono definite le query SQL;
- dove è descritto lo schema del database.
