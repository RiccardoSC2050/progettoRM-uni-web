# Project Plan

**Progetto:** Web application per la gestione di contratti telefonici  
**Corso:** Programmazione Web  
**Gruppo:** RM  
**Codice progetto:** 171  
**Database assegnato:** DB2 - Ex 2 - Telefoni / Contratti Telefonici  
**Tabella CRUD assegnata:** `SIMDisattiva`  
**Interfaccia assegnata:** Interfaccia 5  
**Palette assegnata:** Malva  
**Versione documento:** 1.0  

---

## 1. Scopo del documento

Questo documento definisce il piano di progetto per lo sviluppo della web application richiesta per il Progetto #1 di Programmazione Web.

Il documento descrive gli obiettivi del progetto, le attività da svolgere, le fasi di lavoro, i deliverable previsti, i vincoli tecnici, l’organizzazione del lavoro e i criteri di completamento.

Il documento non descrive lo stato attuale del lavoro svolto, ma solo il piano previsto sulla base delle richieste progettuali.

---

## 2. Obiettivo del progetto

L’obiettivo è realizzare una web application basata sul database assegnato **DB2 - Telefoni / Contratti Telefonici**.

L’applicazione deve permettere la consultazione e la gestione dei dati relativi a:

- contratti telefonici;
- telefonate;
- SIM attive;
- SIM disattive;
- SIM non attive.

Il sistema deve inoltre implementare tutte le operazioni di **CRUD** sulla tabella assegnata:

```text
SIMDisattiva
```

CRUD significa:

```text
Create  -> inserimento dati
Read    -> lettura e ricerca dati
Update  -> modifica dati
Delete  -> cancellazione dati
```

---

## 3. Ambito del progetto

### 3.1 Funzionalità incluse

Il progetto include:

- creazione del database sulla piattaforma scelta;
- popolamento massivo del database;
- sviluppo di pagine di ricerca per le tabelle richieste;
- collegamenti tra dati linkabili;
- informazioni di sintesi tramite query `JOIN`;
- CRUD completo sulla tabella `SIMDisattiva`;
- interfaccia coerente con il template assegnato;
- stile grafico coerente con la palette assegnata;
- pubblicazione online del sito/app;
- consegna del link al sito/app e del repository GitHub.

### 3.2 Funzionalità escluse

Il progetto non prevede:

- autenticazione utenti;
- login;
- gestione di più ruoli utente;
- funzionalità non legate al database assegnato;
- tecnologie non previste dal corso.

---

## 4. Vincoli di progetto

| Codice | Vincolo |
|---|---|
| V-01 | Il database deve essere creato sulla piattaforma scelta dal gruppo. |
| V-02 | Il database deve essere popolato in modo massivo. |
| V-03 | L’applicazione deve usare il database assegnato al gruppo. |
| V-04 | Devono essere realizzate pagine di ricerca per le tabelle richieste. |
| V-05 | I dati linkabili devono essere collegati tramite link. |
| V-06 | Devono essere mostrate informazioni di sintesi tramite `JOIN` quando possibile. |
| V-07 | Deve essere realizzato il CRUD completo sulla tabella `SIMDisattiva`. |
| V-08 | L’interfaccia deve seguire il template assegnato: Interfaccia 5. |
| V-09 | Lo stile deve richiamare la palette assegnata: Malva. |
| V-10 | Nel footer deve essere presente un disclaimer che specifichi che il sito è un progetto d’esame. |
| V-11 | Non è richiesta autenticazione degli utenti. |
| V-12 | Devono essere usate solo le tecnologie presentate nel corso. |

---

## 5. Tecnologie previste

| Tecnologia | Uso previsto |
|---|---|
| HTML | Struttura delle pagine web |
| CSS | Stile grafico e layout |
| JavaScript | Interazioni lato client |
| PHP | Logica server-side e accesso al database |
| MySQL | Database relazionale |
| jQuery | Eventuali interazioni semplificate |
| AJAX | Eventuali aggiornamenti asincroni |
| GitHub | Repository del codice |
| Hosting web | Pubblicazione del sito/app |

---

## 6. Database di riferimento

Il database assegnato riguarda la gestione di contratti telefonici di un operatore mobile.

Le tabelle logiche previste sono:

```text
ContrattoTelefonico
Telefonata
SIMAttiva
SIMDisattiva
SIMNonAttiva
```

| Tabella | Descrizione |
|---|---|
| `ContrattoTelefonico` | Contiene i dati dei contratti telefonici. |
| `Telefonata` | Contiene le telefonate effettuate dai contratti. |
| `SIMAttiva` | Contiene le SIM attualmente associate a un contratto. |
| `SIMDisattiva` | Contiene le SIM disattivate. |
| `SIMNonAttiva` | Contiene le SIM non attive. |

Gli insiemi delle chiavi delle tabelle `SIMAttiva`, `SIMDisattiva` e `SIMNonAttiva` devono essere disgiunti.

---

## 7. Interfaccia utente prevista

L’interfaccia assegnata è:

```text
Interfaccia 5
```

La struttura prevista comprende:

- Header;
- Footer;
- Nav;
- Contenuto/Risultati;
- Filtro Ricerca.

La palette assegnata è:

```text
Malva
```

La palette non implica che tutte le aree debbano avere lo stesso colore, ma che lo stile generale richiami la tonalità dominante assegnata.

---

## 8. Work Breakdown Structure

### WBS-01 - Analisi del progetto

Attività:

- lettura delle linee guida;
- individuazione del database assegnato;
- individuazione della tabella CRUD assegnata;
- individuazione del template di interfaccia;
- individuazione della palette;
- definizione delle funzionalità minime.

Output:

- comprensione degli obiettivi;
- documento dei requisiti;
- project plan.

---

### WBS-02 - Progettazione e creazione del database

Attività:

- creare le tabelle dello schema logico;
- rispettare le relazioni tra le tabelle;
- popolare il database in modo massivo;
- verificare la coerenza dei dati;
- verificare che le SIM attive, disattive e non attive siano disgiunte.

Output:

- database creato;
- database popolato;
- dati coerenti con lo schema assegnato.

---

### WBS-03 - Struttura dell’applicazione web

Attività:

- definire la struttura delle cartelle;
- creare la homepage;
- creare file comuni per header, footer e connessione database;
- predisporre i file CSS e JavaScript;
- configurare il collegamento tra PHP e database.

Output:

- struttura base del sito;
- connessione al database;
- layout iniziale.

---

### WBS-04 - Pagine di ricerca

Attività:

- creare una pagina di ricerca per `ContrattoTelefonico`;
- creare una pagina di ricerca per `Telefonata`;
- creare una pagina di ricerca per `SIMAttiva`;
- creare una pagina di ricerca per `SIMDisattiva`;
- creare una pagina di ricerca per `SIMNonAttiva`;
- aggiungere filtri adeguati alle singole tabelle;
- mostrare i risultati in modo comprensibile.

Output:

- pagine di consultazione dati;
- filtri di ricerca;
- risultati leggibili.

---

### WBS-05 - Link tra dati collegati

Attività:

- individuare i dati collegabili;
- creare link tra SIM e contratti;
- creare link tra telefonate e contratti;
- creare eventuali pagine di dettaglio;
- permettere all’utente di navigare tra dati correlati.

Output:

- navigazione tra entità collegate;
- pagine più informative;
- maggiore usabilità.

---

### WBS-06 - Informazioni di sintesi tramite JOIN

Attività:

- individuare le relazioni utili;
- definire query con `JOIN`;
- mostrare informazioni aggiuntive nei risultati;
- mostrare conteggi o riepiloghi quando utile.

Output:

- pagine arricchite da dati collegati;
- query SQL con `JOIN`;
- informazioni sintetiche per l’utente.

---

### WBS-07 - CRUD su SIMDisattiva

Attività:

- realizzare la lettura delle SIM disattive;
- realizzare il form di inserimento;
- realizzare la logica di inserimento;
- realizzare il form di modifica;
- realizzare la logica di modifica;
- realizzare la cancellazione;
- aggiungere conferme e messaggi di errore;
- validare i dati inseriti dall’utente.

Output:

- CRUD completo su `SIMDisattiva`;
- messaggistica per l’utente;
- gestione degli errori principali.

---

### WBS-08 - Interfaccia grafica

Attività:

- applicare la struttura dell’Interfaccia 5;
- definire header;
- definire footer;
- definire menu di navigazione;
- definire area filtri;
- definire area contenuto/risultati;
- applicare la palette malva;
- rendere l’interfaccia robusta rispetto alla dimensione del browser.

Output:

- layout coerente con il template assegnato;
- stile coerente con la palette;
- interfaccia leggibile e usabile.

---

### WBS-09 - Test

Attività:

- testare la connessione al database;
- testare le pagine di ricerca;
- testare i filtri;
- testare i link tra dati;
- testare le query `JOIN`;
- testare Create;
- testare Read;
- testare Update;
- testare Delete;
- testare i messaggi di errore;
- testare il comportamento online.

Output:

- lista test eseguiti;
- correzione errori;
- versione stabile del progetto.

---

### WBS-10 - Consegna

Attività:

- verificare che il sito/app sia online;
- verificare che il repository GitHub sia aggiornato;
- verificare che il footer contenga il disclaimer;
- preparare la mail di consegna;
- inserire tutti i componenti del gruppo in copia;
- indicare il link al sito/app;
- indicare il link al repository GitHub.

Output:

- sito/app consegnabile;
- repository consegnabile;
- mail di consegna completa.

---

## 9. Milestone

| Milestone | Descrizione | Output |
|---|---|---|
| M1 | Analisi completata | Requisiti e piano definiti |
| M2 | Database creato e popolato | Tabelle e dati disponibili |
| M3 | Struttura web iniziale | Homepage e connessione database |
| M4 | Pagine di ricerca completate | Consultazione dati disponibile |
| M5 | Link e JOIN completati | Dati collegati e sintesi disponibili |
| M6 | CRUD SIMDisattiva completato | Create, Read, Update, Delete funzionanti |
| M7 | Interfaccia completata | Template 5 e palette malva applicati |
| M8 | Test completati | Versione stabile |
| M9 | Consegna completata | Link sito/app e repository inviati |

---

## 10. Pianificazione delle fasi

| Fase | Attività principale | Dipendenze |
|---|---|---|
| Fase 1 | Analisi del progetto | Nessuna |
| Fase 2 | Creazione e popolamento database | Fase 1 |
| Fase 3 | Struttura base applicazione | Fase 1 |
| Fase 4 | Connessione PHP-database | Fase 2, Fase 3 |
| Fase 5 | Pagine di ricerca | Fase 4 |
| Fase 6 | Link e JOIN | Fase 5 |
| Fase 7 | CRUD SIMDisattiva | Fase 4 |
| Fase 8 | Interfaccia grafica | Fase 3, Fase 5 |
| Fase 9 | Test e correzioni | Fasi 5, 6, 7, 8 |
| Fase 10 | Consegna | Fase 9 |

---

## 11. Ruoli di progetto

Il progetto è previsto per gruppi di 2 o 3 persone.

| Ruolo | Responsabilità |
|---|---|
| Responsabile database | Schema, popolamento dati, query SQL, coerenza dati |
| Responsabile backend | PHP, collegamento database, CRUD, validazioni |
| Responsabile frontend | HTML, CSS, layout, template, palette |
| Responsabile test e documentazione | Test, documenti, controllo consegna |

I ruoli possono sovrapporsi: la stessa persona può contribuire a più aree.

---

## 12. Strategia di versionamento

Il codice deve essere mantenuto in un repository GitHub.

Il repository deve contenere:

- codice sorgente;
- file HTML, CSS, JS, PHP;
- eventuale documentazione;
- istruzioni utili per la consegna.

Il repository non dovrebbe contenere:

- password reali;
- credenziali private;
- file temporanei non necessari;
- dati sensibili.

---

## 13. Strategia di test

| Area | Test previsto |
|---|---|
| Database | Verifica tabelle, relazioni e coerenza dati |
| Connessione | Verifica collegamento PHP-MySQL |
| Ricerca | Verifica filtri e risultati |
| Link | Verifica collegamenti tra dati |
| JOIN | Verifica informazioni di sintesi |
| Create | Verifica inserimento in `SIMDisattiva` |
| Read | Verifica lettura e ricerca di `SIMDisattiva` |
| Update | Verifica modifica di `SIMDisattiva` |
| Delete | Verifica cancellazione di `SIMDisattiva` |
| UI | Verifica template, palette e leggibilità |
| Deploy | Verifica funzionamento online |

---

## 14. Rischi progettuali

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Dati non coerenti con lo schema | Alto | Controlli SQL e validazione dati |
| Query lente o troppo pesanti | Medio | Filtri, limiti e query mirate |
| CRUD incompleto | Alto | Sviluppo separato delle quattro operazioni |
| Errori nella gestione dei link | Medio | Test sulle pagine di dettaglio |
| Interfaccia non coerente con il template | Medio | Controllo rispetto all’Interfaccia 5 |
| Palette usata in modo incoerente | Basso | Definizione di uno stile CSS comune |
| Problemi nella consegna | Alto | Verifica preventiva di sito online e repository |

---

## 15. Criteri di completamento

Il progetto può considerarsi completo quando:

- il database è stato creato e popolato;
- le tabelle dello schema logico sono presenti;
- le relazioni tra dati sono rispettate;
- esistono pagine di ricerca per le tabelle richieste;
- i dati collegabili sono linkati;
- sono presenti informazioni di sintesi tramite `JOIN`;
- il CRUD su `SIMDisattiva` è completo;
- l’interfaccia segue il template assegnato;
- lo stile richiama la palette malva;
- il footer contiene il disclaimer di progetto d’esame;
- il sito/app è online;
- il repository GitHub è disponibile;
- la consegna contiene tutti gli elementi richiesti.

---

## 16. Deliverable

| Deliverable | Descrizione |
|---|---|
| Database | Database creato e popolato secondo lo schema assegnato |
| Web application | Applicazione web funzionante |
| Pagine di ricerca | Pagine per consultare i dati |
| CRUD | CRUD completo su `SIMDisattiva` |
| Interfaccia | Layout basato su Interfaccia 5 |
| Stile | Palette malva applicata |
| Repository GitHub | Codice sorgente del progetto |
| Sito/app online | Applicazione pubblicata |
| Documentazione | Requisiti, project plan ed eventuali note tecniche |
| Mail di consegna | Email con oggetto corretto, componenti in copia, link sito/app e repository |

---

## 17. Scadenza e valutazione

Il progetto deve essere consegnato secondo le modalità indicate dal docente.

La valutazione prevista indica:

- voto massimo 8.00 punti se il progetto è consegnato entro il 30 giugno;
- dopo il 30 giugno il voto massimo è 7.50 punti;
- sufficienza a 4.50 punti.

---

## 18. Oggetto della consegna

La consegna deve includere:

- mail con prefisso `[PW26]` nell’oggetto;
- nome del gruppo;
- nome/codice del progetto;
- tutti i componenti del gruppo in copia;
- link al sito/app sviluppata;
- link al repository GitHub;
- eventuale documentazione richiesta o utile.

---

## 19. Piano di priorità

### Priorità alta

- Database corretto e popolato;
- pagine di ricerca;
- link tra dati;
- `JOIN`;
- CRUD su `SIMDisattiva`;
- sito online;
- repository GitHub;
- consegna corretta.

### Priorità media

- miglioramento della navigazione;
- pagine dettaglio;
- messaggistica utente;
- validazioni complete;
- responsive layout.

### Priorità bassa

- effetti grafici avanzati;
- animazioni;
- funzionalità extra non richieste;
- arricchimenti del database non necessari.

---

## 20. Nota finale

Il project plan deve essere aggiornato se il docente fornisce nuove indicazioni o se vengono introdotte modifiche motivate al database o all’interfaccia.

