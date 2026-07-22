# Sviluppo del progetto

## Modalità di lavoro

Il progetto è stato sviluppato con una modalità collaborativa di tipo **pair programming**.

Durante le sessioni di sviluppo, un componente si occupava principalmente della scrittura del codice, mentre l’altro seguiva la revisione, il controllo logico e l’analisi delle scelte implementative. Questo approccio ha permesso di ridurre errori, verificare progressivamente il funzionamento delle funzionalità e mantenere una visione condivisa dell’intero progetto.

## Organizzazione dello sviluppo

Il lavoro è stato organizzato per obiettivi settimanali. All’inizio di ogni fase venivano individuate le funzionalità da completare, le parti da correggere e gli aspetti da migliorare. In base a questi obiettivi veniva poi sviluppato il codice, procedendo per blocchi funzionali.

Lo sviluppo non è stato svolto come semplice divisione isolata dei compiti, ma come attività coordinata: le modifiche venivano discusse, provate e revisionate durante l’avanzamento del progetto.

## Supporto dell’intelligenza artificiale

Durante lo sviluppo è stato utilizzato anche ChatGPT come strumento di supporto allo studio, alla revisione e all’organizzazione del codice.

L’intelligenza artificiale è stata utilizzata principalmente per:

- comprendere meglio alcune scelte architetturali;
- revisionare file e parti di codice durante lo sviluppo;
- individuare possibili errori logici o organizzativi;
- migliorare la leggibilità e la struttura del progetto;
- supportare la realizzazione e il perfezionamento della parte grafica.

La parte CSS e UI è stata quella maggiormente supportata dall’intelligenza artificiale, con l’obiettivo di ottenere un’interfaccia più curata, coerente e responsive.

Nel complesso, il progetto può essere considerato sviluppato prevalentemente dal gruppo, con un supporto tecnico esterno usato come strumento di revisione e miglioramento. La proporzione stimata del lavoro è circa **80% umano** e **20% assistito da intelligenza artificiale**.

## Apprendimento durante lo sviluppo

Il codice è stato compreso e consolidato progressivamente durante la scrittura. Ogni funzionalità sviluppata è stata anche analizzata dal punto di vista pratico, in modo da comprendere il collegamento tra interfaccia, logica JavaScript, chiamate al back-end PHP e operazioni SQL sul database.

Questo metodo ha permesso di apprendere il funzionamento dell’applicazione man mano che veniva costruita, mantenendo il controllo sulle parti principali del progetto.

## Scelte architetturali

Fin dalle prime fasi è stata adottata una separazione chiara tra **front-end** e **back-end**.

Il front-end gestisce la visualizzazione, l’interazione dell’utente e le chiamate asincrone. È composto principalmente da HTML, CSS e JavaScript.

Il back-end è sviluppato in PHP e si occupa della comunicazione con il database, della gestione delle richieste e dell’esecuzione delle operazioni sui dati.

Il progetto mantiene una struttura complessivamente **monolitica**, perché viene distribuito come un’unica applicazione web, ma con una suddivisione interna ordinata tra interfaccia, logica client, logica server e database.

## Database e gestione dei dati

Il database utilizzato è collegato al back-end PHP tramite query SQL. Le operazioni sui dati vengono gestite lato server, mentre il front-end riceve e mostra i risultati all’utente.

La gestione dei dati è stata sviluppata tenendo conto dello schema assegnato per il progetto, relativo ai contratti telefonici e alle SIM. Particolare attenzione è stata data alla coerenza tra SIM attive, SIM disattivate, SIM non attive e contratti telefonici.

## Pubblicazione del progetto

Per la pubblicazione online è stato utilizzato **Altervista** come servizio di hosting.

È stato creato uno spazio web dedicato e il progetto è stato caricato tramite **FTP**, mantenendo la struttura delle cartelle necessaria al corretto funzionamento dell’applicazione. Il dominio Altervista è stato quindi utilizzato per rendere accessibile la web app online.

## Sintesi

Il progetto è stato sviluppato con un metodo collaborativo, progressivo e revisionato. La struttura adottata separa front-end, back-end e database, mantenendo un’architettura monolitica semplice da distribuire e adatta al contesto del progetto universitario.
