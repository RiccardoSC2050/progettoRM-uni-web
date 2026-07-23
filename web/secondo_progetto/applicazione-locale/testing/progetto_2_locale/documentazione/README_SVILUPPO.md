# Note di sviluppo

## Uso di strumenti di intelligenza artificiale

ChatGPT è stato utilizzato soprattutto nella fase iniziale per studiare e configurare la procedura automatica di installazione e avvio locale.

ChatGPT è stato utilizzato anche per una revisione dell'architettura e per comprendere l'integrazione tra Java, Django, PostgreSQL, Tomcat e le API PHP remote.

Lo sviluppo restante è stato gestito dal gruppo. L'intelligenza artificiale è stata usata in parallelo come supporto per chiarire alcuni passaggi e scrivere porzioni selezionate di codice. Ogni parte è stata controllata, adattata e integrata nel progetto.

## Differenze rispetto al Progetto 1

Il Progetto 1 rimane la sorgente remota. Nel Progetto 2 sono stati aggiunti:

- API PHP dedicate all'esportazione;
- servlet Java per coordinare il trasferimento;
- servizio Django per ricevere e validare i dati;
- procedure di creazione delle tabelle PostgreSQL;
- file e logica di migrazione;
- selezione dei contratti e importazione dei relativi dati collegati;
- barra di avanzamento con percentuale;
- launcher automatico;
- visualizzatore relazionale e paginato delle tabelle funzionali.

## Organizzazione del codice

Il progetto separa:

- metadati e regole di dominio;
- coordinamento della migrazione;
- importazione delle singole risorse;
- accesso ai servizi HTTP e a PostgreSQL;
- controller HTTP;
- visualizzatore e interfaccia utente;
- configurazione e gestione del runtime locale.
