# Refactoring manutenzione codice

## Obiettivo

Questo intervento non modifica la logica applicativa, il database o l'interfaccia grafica.
Serve solo a rendere il progetto più ordinato e manutenibile.

## Backend

### Nuovo file comune

- `back-end/core/db.php`

Contiene funzioni riutilizzabili per:

- preparazione delle query
- binding dei parametri
- esecuzione delle query
- lettura di una singola riga
- lettura di più righe
- metadati comuni della paginazione

Questo evita di riscrivere continuamente la stessa sequenza:

```php
$conn->prepare(...)
$stmt->bind_param(...)
$stmt->execute()
$stmt->get_result()
```

### Repository contratti

Il vecchio `contractsRepository.php` era troppo denso.
Ora resta come file di ingresso, ma carica file più piccoli:

- `repositories/contracts/contractsListRepository.php`
- `repositories/contracts/contractDetailRepository.php`
- `repositories/contracts/contractCallsRepository.php`

### Repository telefonate

Il vecchio `callsRepository.php` era troppo denso.
Ora resta come file di ingresso, ma carica file più piccoli:

- `repositories/calls/callsSummaryRepository.php`
- `repositories/calls/callsListRepository.php`

## Frontend

### Lista SIM

Il vecchio `simList.js` conteneva caricamento dati, eventi, modali, creazione, modifica ed eliminazione.
Ora è diviso in:

- `simList.js`: caricamento pagina SIM
- `simListEvents.js`: eventi della pagina
- `simModalController.js`: gestione modali modifica/elimina

### Validazione SIM

Il vecchio `simValidation.js` conteneva sia logica DOM sia regole di validazione.
Ora è diviso in:

- `simValidation.js`: coordinamento generale
- `simFormDom.js`: funzioni DOM comuni del form
- `simValidationRules.js`: regole pure di validazione

## Separazione frontend/backend

- Il backend resta in PHP dentro `back-end`.
- Il frontend resta in HTML/CSS/JS dentro `front-end`.
- Il frontend non contiene PHP.
- Gli URL `.php` nel frontend restano solo endpoint API chiamati da JavaScript.

## Logica non modificata

Non sono stati modificati:

- schema database
- CRUD SIM
- comportamento di attivazione/disattivazione SIM
- nomi delle tabelle
- grafica
- layout
- testi operativi principali
