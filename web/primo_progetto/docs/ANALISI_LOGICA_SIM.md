# Analisi logica CRUD SIM

La gestione SIM deve rispettare lo schema del database assegnato, senza aggiungere colonne e senza creare nuove tabelle.

## Tabelle coinvolte

```text
simnonattiva(codice, tipoSIM)
simattiva(codice, tipoSIM, associataA, dataAttivazione)
simdisattiva(codice, tipoSIM, eraAssociataA, dataAttivazione, dataDisattivazione)
```

Le tre tabelle rappresentano tre stati diversi della stessa entità SIM. Il codice della SIM deve comparire in una sola delle tre tabelle alla volta.

## Regola principale

L'utente non deve mai inserire manualmente date relative alla SIM.

Le date sono conseguenze dell'evento eseguito:

```text
attivazione SIM     => dataAttivazione = data corrente
 disattivazione SIM => dataDisattivazione = data corrente
```

Quindi le date non devono comparire nei form operativi di creazione, attivazione, modifica o disattivazione.

## Creazione SIM

La creazione registra una SIM libera, non ancora associata a un contratto.

Flusso:

```text
input utente: codice, tipoSIM
backend: INSERT in simnonattiva
```

La SIM nasce senza contratto e senza date, perché non è ancora stata attivata su un numero.

## Attivazione SIM

L'attivazione collega una SIM a un contratto telefonico.

Flusso:

```text
input utente: contratto/numero da associare
backend:
- controlla che il contratto esista
- controlla che il contratto non abbia già una SIM attiva
- imposta dataAttivazione = data corrente
- sposta la SIM in simattiva
```

L'utente non inserisce `dataAttivazione`: il giorno di attivazione è il giorno in cui viene eseguita l'operazione.

## Disattivazione SIM

La disattivazione è immediata. Non è una programmazione futura.

Flusso:

```text
input utente: conferma disattivazione
backend:
- legge la SIM attiva
- conserva il contratto precedente in eraAssociataA
- conserva la vecchia dataAttivazione
- imposta dataDisattivazione = data corrente
- sposta la SIM in simdisattiva
```

Dopo la disattivazione, la SIM non è più collegata al contratto come SIM attiva.

## Modifica SIM

La modifica non deve alterare manualmente le date.

Regole:

```text
SIM non attiva  => si possono modificare codice e tipoSIM
SIM attiva      => si possono modificare codice e tipoSIM, ma non il contratto
SIM disattiva   => può essere riattivata oppure eliminata dallo storico
```

Per cambiare contratto a una SIM attiva il flusso corretto è:

```text
1. Disattiva SIM
2. Riattiva SIM scegliendo il nuovo contratto
```

Non si cambia direttamente `associataA` su una SIM attiva, perché quella sarebbe una nuova associazione storica.

## Visualizzazione

Le date vanno mostrate solo in lettura, nelle tabelle o nei dettagli:

```text
simnonattiva  => nessuna data
simattiva     => mostra dataAttivazione
simdisattiva  => mostra dataAttivazione e dataDisattivazione
```

Le date non devono essere campi compilabili dall'utente.

## Conclusione

La logica definitiva è:

```text
Crea       => simnonattiva, senza date
Attiva     => simattiva, dataAttivazione automatica a oggi
Disattiva  => simdisattiva, dataDisattivazione automatica a oggi
Modifica   => aggiorna solo dati compatibili con lo stato
Elimina    => elimina solo SIM già disattivate nello storico
```

Questa soluzione è coerente con il database esistente e non richiede modifiche allo schema.
