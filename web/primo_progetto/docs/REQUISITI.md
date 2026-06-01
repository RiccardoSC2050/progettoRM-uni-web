# Requisiti del progetto

## 1. Dominio applicativo

Il progetto riguarda la gestione di contratti telefonici di un operatore mobile.

Le entità principali sono:

- contratti telefonici;
- telefonate;
- SIM attive;
- SIM disattive;
- SIM non attive.

## 2. Requisiti funzionali

L'applicazione deve permettere di:

- visualizzare una dashboard con informazioni sintetiche;
- consultare l'elenco dei contratti telefonici;
- approfondire i dati di un contratto;
- visualizzare le telefonate effettuate;
- filtrare e ordinare i dati dove previsto;
- gestire le SIM considerando `simattiva`, `simdisattiva` e `simnonattiva`;
- mostrare informazioni collegate tra contratti, SIM e telefonate.

## 3. Gestione SIM

La sezione SIM lavora sull’insieme delle tabelle `simattiva`, `simdisattiva` e `simnonattiva`.

Operazioni richieste:

```text
Create → inserimento di una nuova SIM non attiva
Read   → visualizzazione e ricerca di tutte le SIM
Update → modifica delle SIM attive o non attive
Stato  → attivazione o disattivazione rispettando simattiva, simdisattiva e simnonattiva
Delete → eliminazione consentita solo per SIM disattivate
```

Il form deve guidare l'utente con controlli, messaggi ed esempi. La data di scadenza futura non viene gestita perché non esiste nella tabella `simattiva`. La `dataDisattivazione` viene valorizzata solo quando la SIM passa realmente nello storico `simdisattiva`.

## 4. Requisiti di interfaccia

L'interfaccia deve essere:

- coerente con il dominio telefonico;
- leggibile;
- responsive;
- organizzata in sezioni chiare;
- stabile su mobile e desktop;
- coerente nella gestione di card, tabelle, pulsanti e filtri.

## 5. Requisiti tecnici

Il progetto deve usare tecnologie compatibili con il corso:

- HTML;
- CSS;
- JavaScript;
- PHP;
- MySQL.

Il back-end deve comunicare con il front-end tramite risposte JSON.

## 6. Requisiti sui dati

Il database deve contenere tabelle coerenti con il dominio:

```text
contrattotelefonico
telefonata
simattiva
simdisattiva
simnonattiva
```

Le relazioni principali devono permettere di collegare:

- telefonate e contratti;
- SIM attive e contratti;
- SIM disattive e contratti precedentemente associati.

## 7. Requisiti non funzionali

Il progetto deve essere:

- manutenibile;
- comprensibile;
- diviso per responsabilità;
- coerente nella struttura dei file;
- robusto rispetto al ridimensionamento dello schermo;
- documentato.
