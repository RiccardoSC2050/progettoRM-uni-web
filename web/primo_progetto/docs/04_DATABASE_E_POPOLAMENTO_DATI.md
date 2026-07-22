# Documentazione 4 — Database e popolamento dati

## 1. Creazione del database

Il database del progetto è stato costruito a partire dallo schema assegnato per **Ex 2 - Telefoni**, relativo alla gestione di contratti telefonici, SIM e telefonate.

Le tabelle principali utilizzate sono:

- `contrattotelefonico`;
- `simattiva`;
- `simdisattiva`;
- `simnonattiva`;
- `telefonata`.

Lo schema è stato implementato in SQL e collegato al back-end PHP dell'applicazione.

## 2. Generazione dei dati sintetici

Per popolare il database è stato creato un insieme di dati sintetici con il supporto di **ChatGPT**.

L'obiettivo era ottenere dati numerosi, coerenti e sufficientemente variati per simulare il funzionamento di una compagnia telefonica. I dati generati riguardano:

- contratti telefonici a ricarica e a consumo;
- SIM attive;
- SIM disattivate;
- SIM non attive;
- telefonate associate ai contratti.

Prima dell'inserimento nel database, i dati sono stati organizzati in un file **Excel**, usato come base di controllo e preparazione.

## 3. Caricamento in ambiente locale

Durante la prima fase di sviluppo, il database è stato caricato in locale.

Il file Excel è stato usato come punto di partenza per importare i valori in un database **SQL/MySQL** locale. Questo ambiente è stato utilizzato per:

- sviluppare il codice iniziale;
- testare le query;
- verificare le relazioni tra le tabelle;
- controllare il funzionamento delle operazioni CRUD;
- correggere eventuali incoerenze nei dati.

L'ambiente locale ha permesso di lavorare e modificare il progetto in modo rapido durante la fase di coding.

## 4. Caricamento su Altervista

Dopo la fase locale, lo stesso database è stato caricato anche nel database SQL fornito da **Altervista**.

Il progetto pubblicato su Altervista utilizza quindi una struttura dati equivalente a quella usata in locale. La configurazione PHP del progetto è stata adattata per collegarsi al database online, mantenendo invariata la logica applicativa.

In questo modo il comportamento dell'applicazione online risulta coerente con quello testato in locale.

## 5. Collegamento tra applicazione e database

Il front-end non accede direttamente al database.

Il flusso di gestione dei dati è il seguente:

```text
Front-end JavaScript
↓
API PHP
↓
Query SQL
↓
Database MySQL
```

Le richieste partono dall'interfaccia web, vengono gestite dal back-end PHP e arrivano al database tramite query SQL. I risultati vengono poi restituiti al front-end in formato JSON.

## 6. Sintesi

Il database è stato popolato con dati sintetici generati con supporto di ChatGPT, organizzati inizialmente in Excel e poi importati sia in locale sia su Altervista.

La fase locale è servita per sviluppare e testare il progetto. La fase online su Altervista ha permesso di pubblicare la web app mantenendo la stessa struttura SQL e lo stesso funzionamento applicativo.
