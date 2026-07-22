# Documentazione 3 — Funzionamento della web app

## 1. Scopo dell'applicazione

La web app simula il sistema gestionale di una compagnia telefonica.

L'obiettivo principale è permettere la consultazione e la gestione dei dati relativi a:

- contratti telefonici;
- SIM attive;
- SIM disattivate;
- SIM non ancora attive;
- telefonate effettuate dai contratti.

Il progetto è basato sul database **Ex 2 - Telefoni**. Il centro della gestione è il contratto telefonico, identificato dal numero di telefono. Ogni contratto può essere di tipo **ricarica** oppure **consumo** e può essere collegato a una sola SIM attiva alla volta.

La tabella assegnata per le operazioni CRUD è **SIMDisattiva**, ma la web app gestisce la SIM come entità funzionale complessiva, considerando i tre possibili stati previsti dal database: attiva, disattivata e non attiva.

## 2. Sezioni principali della web app

L'applicazione è organizzata in quattro aree principali.

### Dashboard

La dashboard mostra una sintesi generale del sistema. Serve come pagina iniziale per avere una visione rapida dei dati presenti nel database, ad esempio contratti, SIM e telefonate.

### Contratti

La sezione contratti permette di consultare i contratti telefonici registrati.

Per ogni contratto vengono mostrate le informazioni principali:

- numero telefonico;
- data di attivazione;
- tipo di contratto;
- credito residuo per i contratti a ricarica;
- minuti residui per i contratti a consumo;
- dati di sintesi collegati alle telefonate e alla SIM associata.

È presente anche una pagina di dettaglio del contratto, dove vengono visualizzate informazioni più complete e le telefonate riferite a quel numero.

### Gestione SIM

La sezione SIM è la parte principale dal punto di vista gestionale.

La web app consente di visualizzare e filtrare le SIM in base a:

- codice SIM;
- tipo SIM;
- stato della SIM;
- contratto associato o precedentemente associato;
- date di attivazione e disattivazione.

Gli stati gestiti sono:

- **SIM attiva**: SIM attualmente collegata a un contratto telefonico;
- **SIM disattivata**: SIM presente nello storico, con contratto precedente e data di disattivazione;
- **SIM non attiva**: SIM registrata nel sistema ma non ancora collegata a un contratto.

### Telefonate

La sezione telefonate permette di consultare le chiamate registrate nel database.

Ogni telefonata è collegata a un contratto telefonico e contiene:

- identificativo della telefonata;
- contratto che ha effettuato la chiamata;
- data e ora;
- durata;
- costo.

Sono presenti filtri e riepiloghi per facilitare la consultazione dei dati.

## 3. Funzionamento CRUD sulle SIM

La gestione CRUD riguarda principalmente il ciclo di vita delle SIM.

### Create

La creazione inserisce una nuova SIM nel sistema.

In fase di creazione vengono richiesti solo i dati essenziali:

- codice SIM;
- tipo SIM.

Una SIM appena creata nasce come **non attiva**, quindi senza contratto associato e senza date di attivazione o disattivazione.

### Read

La lettura permette di visualizzare l'elenco delle SIM presenti nel sistema.

Il sistema unifica in un'unica vista funzionale le informazioni provenienti dalle tabelle:

- `simattiva`;
- `simdisattiva`;
- `simnonattiva`.

In questo modo l'utente non deve consultare separatamente le tre tabelle, ma può vedere direttamente lo stato operativo di ogni SIM.

### Update

La modifica permette di aggiornare una SIM rispettando le regole del database.

Le operazioni principali sono:

- modificare codice e tipo della SIM;
- attivare una SIM non attiva o disattivata;
- disattivare una SIM attiva;
- riattivare una SIM presente nello storico.

Il contratto di una SIM attiva non viene modificato direttamente. Per cambiare contratto è necessario disattivare prima la SIM e poi riattivarla su un nuovo contratto disponibile.

Le date operative sono gestite dal back-end:

- la data di attivazione viene impostata quando la SIM viene collegata a un contratto;
- la data di disattivazione viene impostata quando la SIM viene disattivata.

### Delete

L'eliminazione è limitata alle SIM disattivate presenti nello storico.

Questa scelta evita la cancellazione diretta di SIM attive o non attive e mantiene più controllato il ciclo di vita dei dati.

## 4. Regole funzionali principali

La web app applica alcune regole per mantenere coerente il collegamento tra SIM e contratti.

La regola principale è che un contratto telefonico non può essere collegato contemporaneamente a più SIM attive.

Inoltre:

- una SIM attiva deve avere un contratto associato;
- una SIM non attiva non deve avere un contratto associato;
- una SIM disattivata conserva lo storico del contratto precedente;
- una SIM disattivata può essere riattivata oppure eliminata;
- una SIM non attiva può essere mantenuta senza contratto oppure attivata;
- una SIM attiva può essere disattivata e spostata nello storico.

Il back-end effettua controlli sui dati prima di salvarli nel database. In caso di errore, restituisce messaggi gestiti dall'interfaccia.

## 5. Gestione del database

Il database è composto dalle tabelle previste dallo schema dei contratti telefonici:

- `contrattotelefonico`;
- `simattiva`;
- `simdisattiva`;
- `simnonattiva`;
- `telefonata`.

Le relazioni principali sono:

- le SIM attive sono collegate ai contratti tramite `associataA`;
- le SIM disattivate conservano il contratto precedente tramite `eraAssociataA`;
- le telefonate sono collegate ai contratti tramite `effettuataDa`.

Le query SQL vengono eseguite dal back-end PHP. Il front-end non comunica direttamente con il database, ma usa chiamate asincrone verso le API PHP.

## 6. Flusso generale di utilizzo

Il funzionamento generale della web app segue questo flusso:

1. l'utente naviga tra dashboard, contratti, SIM e telefonate;
2. il front-end JavaScript carica la sezione richiesta;
3. il front-end invia una richiesta asincrona alle API PHP;
4. il back-end legge o modifica i dati tramite SQL;
5. il risultato viene restituito in formato JSON;
6. il front-end aggiorna la pagina senza ricaricare completamente l'applicazione.

Questa organizzazione rende l'applicazione più fluida e separa chiaramente la parte visiva dalla parte logica.

## 7. Sintesi funzionale

La web app permette di gestire un piccolo sistema informativo per una compagnia telefonica.

La parte di consultazione consente di analizzare contratti, SIM e telefonate. La parte CRUD permette di gestire il ciclo di vita delle SIM, rispettando le regole di associazione con i contratti telefonici.

Il funzionamento complessivo è basato su una struttura monolitica PHP/MySQL con front-end separato in HTML, CSS e JavaScript. Il collegamento tra interfaccia e database avviene tramite API PHP e richieste asincrone.
