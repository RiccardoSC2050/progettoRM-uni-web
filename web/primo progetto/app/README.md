# Progetto Telefonia

Questa cartella contiene l'applicazione web in PHP del progetto telefonia.

## Struttura

- `index.php`: punto di ingresso dell'applicazione
- `includes/`: configurazione, connessione DB, layout e funzioni comuni
- `repositories/`: accesso ai dati
- `pages/`: pagine applicative
- `crud/`: operazioni CRUD dedicate
- `views/`: template di rendering
- `css/`, `js/`, `assets/`: risorse statiche

## Risorse del progetto

I contenuti documentali e i dataset sono stati riorganizzati fuori dall'applicazione, senza modificarne il contenuto:

- Documentazione: `../docs/`
- File Excel: `../data/excel/`
- File CSV: `../data/csv/`

L'applicazione li considera risorse esterne al codice, mantenendoli separati dalla parte software.
