# Note di sviluppo

## Uso di strumenti di intelligenza artificiale

ChatGPT è stato utilizzato soprattutto nella fase iniziale per studiare e configurare la procedura automatica di installazione e avvio locale.

ChatGPT è stato utilizzato anche per una revisione complessiva dell'architettura e per comprendere l'integrazione tra Java, Django, PostgreSQL, Tomcat e le API PHP remote.

Lo sviluppo restante è stato gestito dal gruppo. L'intelligenza artificiale è stata usata in parallelo come supporto per chiarire alcuni passaggi e scrivere porzioni selezionate di codice. Ogni parte è stata controllata, adattata e integrata nel progetto.

## Differenze rispetto al Progetto 1

Il Progetto 1 rimane la sorgente remota dei dati. Nel Progetto 2 sono stati aggiunti:

- API PHP dedicate all'esportazione dei dati;
- servlet Java per coordinare il trasferimento;
- servizio Django locale per ricevere e validare i dati;
- modelli e procedure di creazione delle tabelle PostgreSQL;
- file e logica di migrazione dei dati;
- importazione limitata e progressiva;
- barra di avanzamento con percentuale;
- launcher automatico per avvio e arresto dei servizi;
- visualizzatore locale delle sole tabelle funzionali.

## Organizzazione del codice

Il progetto separa:

- dominio e regole applicative;
- casi d'uso di importazione;
- accesso ai servizi esterni e al database;
- controller HTTP;
- interfaccia utente;
- configurazione e gestione del runtime locale.
