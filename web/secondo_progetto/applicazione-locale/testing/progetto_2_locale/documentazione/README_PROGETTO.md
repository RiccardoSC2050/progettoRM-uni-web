# Progetto 2 — Caso B

## Obiettivo

Il progetto migra un campione dei dati del Progetto 1, pubblicato online, verso un database PostgreSQL locale.

## Tecnologie utilizzate

- PHP e MySQL: API remote del Progetto 1 su Altervista.
- Java Servlet e Tomcat: coordinamento della migrazione e interfaccia web locale.
- Python e Django: ricezione, validazione e salvataggio dei dati.
- PostgreSQL: database locale di destinazione.
- HTML, CSS e JavaScript: interfaccia, richieste asincrone e barra di avanzamento.
- PowerShell, Batch e Shell: installazione, avvio, diagnostica e arresto.
- Maven: compilazione della servlet Java.

## Piano B — funzionamento

```text
Progetto 1 remoto
PHP + MySQL
        ↓ JSON/HTTP
Servlet Java locale
        ↓ JSON/HTTP
Servizio Django locale
        ↓
PostgreSQL locale
```

La servlet legge i dati dalle API remote, li trasferisce a Django in blocchi e aggiorna la percentuale di avanzamento. Django crea il database richiesto e salva soltanto le tabelle funzionali del progetto.

## Struttura principale

- `servlet-java/`: coordinamento, interfaccia web e avanzamento dell'importazione.
- `django-service/`: API locale e accesso a PostgreSQL.
- `runtime_launcher/`: controllo dei prerequisiti e gestione dei servizi.
- `database/`: script SQL di supporto.
- `documentazione/`: documenti sintetici del progetto.
