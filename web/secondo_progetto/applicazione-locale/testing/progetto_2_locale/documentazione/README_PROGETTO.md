# Progetto 2 — Caso B

## Obiettivo

Il progetto migra un campione coerente dei dati del Progetto 1 online verso un database PostgreSQL locale.

## Tecnologie utilizzate

- PHP e MySQL: API remote del Progetto 1 su Altervista.
- Java Servlet e Tomcat: coordinamento della migrazione e interfaccia locale.
- Python e Django: validazione e salvataggio dei dati.
- PostgreSQL: database locale di destinazione.
- HTML, CSS e JavaScript: interfaccia e avanzamento asincrono.
- PowerShell, Batch e Shell: installazione, avvio e arresto.
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

La servlet seleziona prima i contratti telefonici. Successivamente importa tutte le SIM attive, le SIM disattivate e le telefonate collegate ai contratti selezionati. Ogni contratto può avere una o più SIM disattivate nello storico.

Il visualizzatore PostgreSQL presenta una vista per contratto e permette di consultare tutte le righe delle tabelle tramite paginazione.

## Struttura principale

- `servlet-java/`: coordinamento, filtri relazionali e interfaccia web.
- `django-service/`: API locale, schema funzionale e visualizzatore PostgreSQL.
- `runtime_launcher/`: controllo dei prerequisiti e gestione dei servizi.
- `database/`: script SQL di supporto.
- `documentazione/`: documenti sintetici del progetto.
