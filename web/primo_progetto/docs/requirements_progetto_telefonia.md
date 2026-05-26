# Requirements Specification

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

Questo documento definisce i requisiti della web application da sviluppare per il Progetto #1 di Programmazione Web.

Il documento descrive:

- requisiti funzionali;
- requisiti non funzionali;
- requisiti sui dati;
- requisiti di interfaccia;
- requisiti di consegna;
- casi d’uso principali;
- criteri di accettazione.

Il documento è basato sulle richieste del progetto e sulle indicazioni fornite dal docente.

---

## 2. Descrizione generale del sistema

Il sistema da realizzare è una web application per la gestione di contratti telefonici di un operatore mobile.

Il sistema deve permettere all’utente di consultare dati relativi a:

- contratti telefonici;
- telefonate effettuate;
- SIM attive;
- SIM disattive;
- SIM non attive.

Il sistema deve inoltre permettere la gestione completa della tabella `SIMDisattiva` tramite operazioni di CRUD.

---

## 3. Attori

### 3.1 Utente target

L’utente target è un utente interessato alla consultazione e gestione dei dati dell’operatore telefonico.

L’applicazione deve essere pensata per un solo tipo di utente.

Non è richiesta autenticazione.

### 3.2 Sistema database

Il database MySQL contiene le informazioni relative a contratti, SIM e telefonate.

Il sistema web interroga il database per mostrare, cercare, inserire, modificare ed eliminare dati.

---

## 4. Glossario

| Termine | Significato |
|---|---|
| Contratto telefonico | Contratto identificato da un numero di telefono. |
| Contratto a ricarica | Contratto caratterizzato da credito residuo. |
| Contratto a consumo | Contratto caratterizzato da minuti residui. |
| SIM attiva | SIM attualmente associata a un contratto telefonico. |
| SIM disattiva | SIM precedentemente associata a un contratto e successivamente disattivata. |
| SIM non attiva | SIM presente nel sistema ma non attualmente associata a un contratto. |
| Telefonata | Chiamata effettuata da un contratto telefonico. |
| CRUD | Create, Read, Update, Delete. |
| JOIN | Operazione SQL per collegare dati presenti in tabelle diverse. |
| Template interfaccia | Struttura grafica assegnata per la disposizione degli elementi nella pagina. |
| Palette | Colore o insieme di colori di riferimento per lo stile grafico. |

---

## 5. Ambito del sistema

### 5.1 Funzionalità incluse

Il sistema deve includere:

- pagine per cercare dati nelle tabelle del database;
- visualizzazione dei risultati delle ricerche;
- collegamenti tra dati collegati;
- informazioni di sintesi tramite `JOIN`;
- CRUD completo sulla tabella `SIMDisattiva`;
- interfaccia basata su Interfaccia 5;
- stile coerente con palette Malva;
- footer con disclaimer di progetto d’esame;
- pubblicazione online dell’applicazione;
- repository GitHub o archivio del codice.

### 5.2 Funzionalità escluse

Il sistema non deve includere obbligatoriamente:

- login;
- autenticazione;
- gestione ruoli;
- gestione utenti;
- numero telefonico chiamato nelle telefonate;
- funzionalità non richieste dal database assegnato.

---

## 6. Requisiti funzionali

### RF-01 - Homepage

Il sistema deve fornire una homepage dell’applicazione.

La homepage deve permettere all’utente di accedere alle principali sezioni del sito.

Deve contenere almeno:

- titolo dell’applicazione;
- breve descrizione del sistema;
- menu di navigazione;
- accesso alle pagine principali.

**Priorità:** Alta

---

### RF-02 - Navigazione principale

Il sistema deve fornire un menu di navigazione.

Il menu deve permettere di raggiungere almeno:

- pagina contratti telefonici;
- pagina telefonate;
- pagina SIM attive;
- pagina SIM disattive;
- pagina SIM non attive;
- funzioni CRUD su `SIMDisattiva`.

**Priorità:** Alta

---

### RF-03 - Ricerca contratti telefonici

Il sistema deve permettere la ricerca dei contratti telefonici.

La pagina deve mostrare dati della tabella `ContrattoTelefonico`.

La ricerca può prevedere criteri come:

- numero di telefono;
- tipo di contratto;
- data di attivazione;
- presenza di minuti residui;
- presenza di credito residuo.

I risultati devono mostrare almeno:

- numero;
- data di attivazione;
- tipo;
- minuti residui, se presenti;
- credito residuo, se presente.

**Priorità:** Alta

---

### RF-04 - Ricerca telefonate

Il sistema deve permettere la ricerca delle telefonate.

La pagina deve mostrare dati della tabella `Telefonata`.

La ricerca può prevedere criteri come:

- contratto che ha effettuato la telefonata;
- data;
- ora;
- durata;
- costo.

I risultati devono mostrare almeno:

- identificativo telefonata;
- contratto che ha effettuato la telefonata;
- data;
- ora;
- durata;
- costo.

**Priorità:** Alta

---

### RF-05 - Ricerca SIM attive

Il sistema deve permettere la ricerca delle SIM attive.

La pagina deve mostrare dati della tabella `SIMAttiva`.

La ricerca può prevedere criteri come:

- codice SIM;
- tipo SIM;
- contratto associato;
- data di attivazione.

I risultati devono mostrare almeno:

- codice;
- tipo SIM;
- contratto associato;
- data di attivazione.

**Priorità:** Alta

---

### RF-06 - Ricerca SIM disattive

Il sistema deve permettere la ricerca delle SIM disattive.

La pagina deve mostrare dati della tabella `SIMDisattiva`.

La ricerca può prevedere criteri come:

- codice SIM;
- tipo SIM;
- contratto precedentemente associato;
- data di attivazione;
- data di disattivazione.

I risultati devono mostrare almeno:

- codice;
- tipo SIM;
- contratto precedentemente associato;
- data di attivazione;
- data di disattivazione.

**Priorità:** Alta

---

### RF-07 - Ricerca SIM non attive

Il sistema deve permettere la ricerca delle SIM non attive.

La pagina deve mostrare dati della tabella `SIMNonAttiva`.

La ricerca può prevedere criteri come:

- codice SIM;
- tipo SIM.

I risultati devono mostrare almeno:

- codice;
- tipo SIM.

**Priorità:** Media

---

### RF-08 - Collegamenti tra dati

Il sistema deve creare link tra dati collegati quando questi sono linkabili.

Esempi:

- da una SIM attiva al contratto associato;
- da una SIM disattiva al contratto precedentemente associato;
- da una telefonata al contratto che l’ha effettuata;
- da un contratto alle telefonate associate.

**Priorità:** Alta

---

### RF-09 - Informazioni di sintesi tramite JOIN

Il sistema deve mostrare informazioni di sintesi tramite query `JOIN` quando possibile.

Esempi:

- numero di telefonate effettuate da un contratto;
- costo totale delle telefonate di un contratto;
- SIM attiva associata a un contratto;
- elenco o numero di SIM disattivate collegate a un contratto;
- tipo di contratto associato a una SIM.

**Priorità:** Alta

---

### RF-10 - Dettaglio contratto telefonico

Il sistema deve permettere di visualizzare una pagina di dettaglio per un contratto telefonico.

La pagina di dettaglio può mostrare:

- numero;
- data di attivazione;
- tipo contratto;
- minuti residui o credito residuo;
- SIM attiva associata, se presente;
- SIM disattive associate in passato, se presenti;
- numero di telefonate;
- costo totale delle telefonate.

**Priorità:** Media

---

### RF-11 - CRUD: lettura SIMDisattiva

Il sistema deve permettere la lettura e consultazione delle SIM disattive.

Deve essere possibile:

- visualizzare le SIM disattive;
- cercare SIM disattive;
- filtrare i risultati;
- accedere alle azioni di modifica ed eliminazione.

**Priorità:** Alta

---

### RF-12 - CRUD: creazione SIMDisattiva

Il sistema deve permettere l’inserimento di una nuova SIM disattiva.

Il form deve gestire almeno:

- codice;
- tipo SIM;
- contratto precedentemente associato;
- data di attivazione;
- data di disattivazione.

Il sistema deve verificare che i dati inseriti siano coerenti.

**Priorità:** Alta

---

### RF-13 - CRUD: modifica SIMDisattiva

Il sistema deve permettere la modifica dei dati di una SIM disattiva.

Il sistema deve permettere la modifica dei dati previsti e deve comunicare all’utente l’esito dell’operazione.

**Priorità:** Alta

---

### RF-14 - CRUD: eliminazione SIMDisattiva

Il sistema deve permettere l’eliminazione di una SIM disattiva.

Prima della cancellazione deve essere richiesta una conferma all’utente.

Il sistema deve comunicare l’esito dell’operazione.

**Priorità:** Alta

---

### RF-15 - Messaggistica utente

Il sistema deve fornire messaggi chiari all’utente.

I messaggi devono riguardare almeno:

- inserimento riuscito;
- modifica riuscita;
- eliminazione riuscita;
- errore di validazione;
- errore di ricerca;
- errore di connessione o interrogazione al database.

I messaggi non devono basarsi esclusivamente su `alert`.

**Priorità:** Media

---

### RF-16 - Validazione dei dati

Il sistema deve controllare gli input forniti dall’utente.

La validazione deve riguardare almeno:

- campi obbligatori;
- formato delle date;
- coerenza tra data di attivazione e data di disattivazione;
- esistenza del contratto associato;
- non duplicazione del codice SIM tra insiemi che devono essere disgiunti.

**Priorità:** Alta

---

### RF-17 - Footer con disclaimer

Il sistema deve mostrare nel footer un disclaimer che indichi che il sito è un progetto d’esame.

**Priorità:** Alta

---

### RF-18 - Pubblicazione online

Il sistema deve essere accessibile tramite sito/app online.

La consegna deve includere il link al sito/app sviluppata.

**Priorità:** Alta

---

### RF-19 - Repository del codice

Il codice del progetto deve essere disponibile tramite repository GitHub o archivio equivalente.

La consegna deve includere il link al repository GitHub o il codice in formato ZIP.

**Priorità:** Alta

---

### RF-20 - Documentazione minima

La consegna deve includere una breve documentazione.

La documentazione deve descrivere almeno:

- utente target dell’applicazione;
- eventuali modifiche apportate al database rispetto allo schema iniziale.

**Priorità:** Alta

---

## 7. Requisiti non funzionali

### RNF-01 - Usabilità

L’interfaccia deve essere comprensibile per l’utente target.

Le funzioni principali devono essere raggiungibili tramite navigazione chiara.

**Priorità:** Alta

### RNF-02 - Coerenza grafica

Lo stile grafico deve richiamare la palette Malva.

Non è necessario usare un unico colore per tutti gli elementi, ma deve essere riconoscibile una tonalità dominante coerente.

**Priorità:** Alta

### RNF-03 - Robustezza dell’interfaccia

L’interfaccia deve essere il più possibile robusta rispetto ai cambiamenti di dimensione del browser.

**Priorità:** Media

### RNF-04 - Separazione del codice

Il codice deve essere organizzato in file separati quando opportuno.

In particolare:

- HTML/PHP per struttura e logica server-side;
- CSS per lo stile;
- JavaScript in file separati quando utilizzato.

**Priorità:** Media

### RNF-05 - Tecnologie consentite

Il progetto deve usare le tecnologie presentate nel corso:

- HTML;
- CSS;
- JavaScript;
- PHP;
- jQuery;
- AJAX.

**Priorità:** Alta

### RNF-06 - Prestazioni

Le pagine che interrogano molte righe del database devono evitare di caricare troppi dati contemporaneamente.

Sono ammessi strumenti come:

- filtri;
- limiti sui risultati;
- paginazione;
- ordinamento.

**Priorità:** Media

### RNF-07 - Sicurezza minima sugli input

Gli input dell’utente devono essere gestiti in modo da evitare errori e comportamenti indesiderati.

Il sistema deve evitare di stampare direttamente dati non controllati in pagina.

**Priorità:** Alta

### RNF-08 - Manutenibilità

Il codice deve essere leggibile e organizzato.

I nomi di file, variabili e funzioni devono essere comprensibili.

**Priorità:** Media

---

## 8. Requisiti sui dati

### RD-01 - Tabelle richieste

Il database deve contenere le seguenti tabelle logiche:

```text
ContrattoTelefonico
Telefonata
SIMAttiva
SIMDisattiva
SIMNonAttiva
```

**Priorità:** Alta

### RD-02 - ContrattoTelefonico

La tabella `ContrattoTelefonico` deve contenere:

- numero;
- dataAttivazione;
- tipo;
- minutiResidui;
- creditoResiduo.

La tabella deve rappresentare contratti a consumo e contratti a ricarica.

**Priorità:** Alta

### RD-03 - Telefonata

La tabella `Telefonata` deve contenere:

- id;
- effettuataDa;
- data;
- ora;
- durata;
- costo.

Ogni telefonata deve essere collegata al contratto che l’ha effettuata.

**Priorità:** Alta

### RD-04 - SIMAttiva

La tabella `SIMAttiva` deve contenere:

- codice;
- tipoSIM;
- associataA;
- dataAttivazione.

Deve essere previsto un indice senza duplicati su `associataA`.

**Priorità:** Alta

### RD-05 - SIMDisattiva

La tabella `SIMDisattiva` deve contenere:

- codice;
- tipoSIM;
- eraAssociataA;
- dataAttivazione;
- dataDisattivazione.

Questa è la tabella assegnata per il CRUD.

**Priorità:** Alta

### RD-06 - SIMNonAttiva

La tabella `SIMNonAttiva` deve contenere:

- codice;
- tipoSIM.

**Priorità:** Alta

### RD-07 - Disgiunzione delle SIM

Gli insiemi delle chiavi delle tabelle `SIMAttiva`, `SIMDisattiva` e `SIMNonAttiva` devono essere disgiunti.

Lo stesso codice SIM non deve comparire contemporaneamente in più di una delle tre tabelle.

**Priorità:** Alta

### RD-08 - Coerenza del contratto

Per `ContrattoTelefonico` deve valere la distinzione tra:

- contratto a consumo con minuti residui;
- contratto a ricarica con credito residuo.

**Priorità:** Alta

---

## 9. Requisiti di interfaccia

### RI-01 - Template assegnato

L’applicazione deve seguire l’Interfaccia 5.

La pagina deve prevedere le seguenti aree:

- Header;
- Footer;
- Nav;
- Contenuto/Risultati;
- Filtro Ricerca.

**Priorità:** Alta

### RI-02 - Header

L’header deve identificare l’applicazione.

Può contenere:

- titolo;
- sottotitolo;
- riferimento al progetto.

**Priorità:** Media

### RI-03 - Navigazione

L’area Nav deve permettere il passaggio tra le pagine principali.

**Priorità:** Alta

### RI-04 - Filtro ricerca

L’area Filtro Ricerca deve contenere i campi necessari per cercare e filtrare i dati.

**Priorità:** Alta

### RI-05 - Contenuto/Risultati

L’area Contenuto/Risultati deve mostrare i dati restituiti dalle query.

I dati devono essere leggibili e organizzati.

**Priorità:** Alta

### RI-06 - Footer

Il footer deve contenere un disclaimer che specifichi che il sito è un progetto d’esame.

**Priorità:** Alta

---

## 10. Casi d’uso principali

### UC-01 - Consultare contratti telefonici

**Attore:** Utente target  
**Precondizione:** Il database contiene contratti telefonici.  
**Flusso principale:**

1. L’utente apre la pagina dei contratti.
2. Il sistema mostra un filtro di ricerca.
3. L’utente inserisce eventuali criteri.
4. Il sistema mostra i contratti corrispondenti.

**Postcondizione:** L’utente visualizza i dati dei contratti.

---

### UC-02 - Consultare SIM disattive

**Attore:** Utente target  
**Precondizione:** Il database contiene SIM disattive.  
**Flusso principale:**

1. L’utente apre la pagina SIM disattive.
2. Il sistema mostra un filtro di ricerca.
3. L’utente inserisce eventuali criteri.
4. Il sistema mostra le SIM disattive corrispondenti.

**Postcondizione:** L’utente visualizza le SIM disattive.

---

### UC-03 - Inserire SIM disattiva

**Attore:** Utente target  
**Precondizione:** L’utente si trova nella sezione CRUD di `SIMDisattiva`.  
**Flusso principale:**

1. L’utente apre il form di inserimento.
2. L’utente compila i dati richiesti.
3. Il sistema valida i dati.
4. Il sistema inserisce la nuova SIM disattiva.
5. Il sistema mostra un messaggio di conferma.

**Flusso alternativo:** se i dati non sono validi, il sistema mostra un messaggio di errore.

---

### UC-04 - Modificare SIM disattiva

**Attore:** Utente target  
**Precondizione:** La SIM disattiva esiste.  
**Flusso principale:**

1. L’utente seleziona una SIM disattiva.
2. L’utente apre il form di modifica.
3. L’utente modifica i dati.
4. Il sistema valida i dati.
5. Il sistema aggiorna la SIM disattiva.
6. Il sistema mostra un messaggio di conferma.

---

### UC-05 - Eliminare SIM disattiva

**Attore:** Utente target  
**Precondizione:** La SIM disattiva esiste.  
**Flusso principale:**

1. L’utente seleziona l’azione di eliminazione.
2. Il sistema richiede conferma.
3. L’utente conferma.
4. Il sistema elimina la SIM disattiva.
5. Il sistema mostra un messaggio di conferma.

---

### UC-06 - Consultare dati collegati

**Attore:** Utente target  
**Precondizione:** Esistono dati collegati tra tabelle.  
**Flusso principale:**

1. L’utente visualizza una pagina di risultati.
2. Il sistema mostra link verso dati collegati.
3. L’utente clicca un link.
4. Il sistema mostra il dettaglio o i dati collegati.

---

## 11. Matrice requisiti / funzionalità

| Requisito | Funzionalità collegata | Priorità |
|---|---|---|
| RF-01 | Homepage | Alta |
| RF-02 | Navigazione | Alta |
| RF-03 | Ricerca contratti | Alta |
| RF-04 | Ricerca telefonate | Alta |
| RF-05 | Ricerca SIM attive | Alta |
| RF-06 | Ricerca SIM disattive | Alta |
| RF-07 | Ricerca SIM non attive | Media |
| RF-08 | Link tra dati | Alta |
| RF-09 | JOIN e sintesi | Alta |
| RF-10 | Dettaglio contratto | Media |
| RF-11 | Read SIMDisattiva | Alta |
| RF-12 | Create SIMDisattiva | Alta |
| RF-13 | Update SIMDisattiva | Alta |
| RF-14 | Delete SIMDisattiva | Alta |
| RF-15 | Messaggistica | Media |
| RF-16 | Validazione dati | Alta |
| RF-17 | Footer disclaimer | Alta |
| RF-18 | Pubblicazione online | Alta |
| RF-19 | Repository codice | Alta |
| RF-20 | Documentazione minima | Alta |

---

## 12. Criteri di accettazione

Il progetto soddisfa i requisiti quando:

- il database è creato secondo lo schema logico assegnato;
- il database è popolato con dati numerosi e vari;
- l’applicazione è online;
- esistono pagine di ricerca per le tabelle richieste;
- i risultati sono visualizzati in modo leggibile;
- i dati collegabili sono linkati;
- sono presenti informazioni di sintesi tramite `JOIN`;
- il CRUD su `SIMDisattiva` è completo;
- l’interfaccia segue Interfaccia 5;
- lo stile richiama la palette Malva;
- il footer contiene il disclaimer di progetto d’esame;
- il codice è disponibile tramite repository GitHub o ZIP;
- la consegna include il link al sito/app;
- la consegna include la documentazione richiesta.

---

## 13. Requisiti di consegna

La consegna deve includere:

- mail con prefisso `[PW26]` nell’oggetto;
- nome del gruppo;
- nome o codice del progetto;
- tutti i componenti del gruppo in copia;
- link al sito/app sviluppata;
- link al repository GitHub o ZIP con codice;
- Excel o ODS usato per popolare il database;
- breve documentazione sull’utente target ed eventuali modifiche al database.

---

## 14. Priorità complessive

### Priorità alta

- database conforme allo schema assegnato;
- pagine di ricerca;
- link tra dati;
- query `JOIN`;
- CRUD completo su `SIMDisattiva`;
- interfaccia assegnata;
- palette assegnata;
- consegna corretta.

### Priorità media

- pagine di dettaglio;
- filtri avanzati;
- messaggi più completi;
- paginazione;
- miglioramento responsive.

### Priorità bassa

- animazioni;
- effetti grafici avanzati;
- funzionalità extra non richieste;
- arricchimenti non necessari del database.

---

## 15. Note finali

I requisiti devono essere aggiornati in caso di nuove indicazioni del docente.

Eventuali modifiche al database rispetto allo schema iniziale devono essere documentate.

