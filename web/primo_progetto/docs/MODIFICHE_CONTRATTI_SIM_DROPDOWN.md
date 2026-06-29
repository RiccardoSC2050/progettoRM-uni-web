# Modifiche contratti e configurazione SIM

## Motivo dei `0 min`

La colonna `Credito / minuti` mostrava `minutiResidui` dalla tabella `contrattotelefonico`.
Nel database i contratti a consumo possono avere `minutiResidui = 0`; questo valore non viene aggiornato dalle telefonate registrate.
Le telefonate invece sono salvate nella tabella `telefonata` e aggregate come `durataTotale`.

Per questo motivo un contratto poteva avere telefonate presenti ma mostrare comunque `0 min` nella colonna `Credito / minuti`.

## Correzione applicata

Per i contratti a consumo la colonna `Credito / minuti` usa ora il minutaggio aggregato delle telefonate (`durataTotale`).
Per i contratti a ricarica resta invariata la visualizzazione del credito residuo in euro.

## Ripristino richiesto

È stata rimossa dalla colonna `Telefonate` la seconda riga con i minuti totali.
La colonna `Telefonate` mostra di nuovo solo il numero di telefonate.

## Configurazione SIM

Il campo `Contratto` nella configurazione SIM è stato trasformato da campo testuale con suggerimenti a menu a tendina.
Il menu mostra solo i contratti disponibili senza SIM attiva, usando gli stessi dati già caricati dal progetto.
