# RK/MK - Progetto Programmazione Web

Applicazione web didattica per la gestione di contratti telefonici, SIM e telefonate.

Il progetto è stato sviluppato con una separazione chiara tra front-end, back-end e database. L'obiettivo non è solo mostrare dati, ma costruire un'applicazione leggibile, mantenibile e coerente nel collegamento tra interfaccia, API PHP e base dati MySQL.

## Tecnologie

- HTML
- CSS
- JavaScript modulare
- PHP
- MySQL
- GitHub per versionamento e lavoro condiviso

## Struttura principale

```text
.
├── index.html
├── front-end/
│   ├── css/
│   ├── js/
│   └── image/
├── back-end/
│   ├── api/
│   ├── config/
│   ├── core/
│   ├── repositories/
│   └── services/
├── database/
└── docs/
```

## Avvio locale

1. Importare lo schema del database da `database/schema.sql`.
2. Configurare la connessione in `back-end/config/database.php` oppure creare `back-end/config/database.local.php` partendo da `database.local.example.php`.
3. Eseguire il progetto in un ambiente PHP/MySQL, ad esempio XAMPP o hosting compatibile.
4. Aprire `index.html` dal server locale o dallo spazio web configurato.

## Documentazione

La documentazione tecnica si trova in `docs/`.

File principali:

- `docs/RELAZIONE_PROGETTO.md`
- `docs/ARCHITETTURA.md`
- `docs/METODO_DI_LAVORO.md`
- `docs/UI_UX_E_RESPONSIVE.md`
- `docs/TEST_E_REVISIONE.md`
- `docs/REQUISITI.md`

La cartella `database/` contiene la struttura SQL necessaria per ricostruire il database.
