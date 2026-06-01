# Database

Questa cartella contiene la struttura SQL necessaria per ricreare il database del progetto RK/MK.

## File

```text
database/
├── README.md
└── schema.sql
```

## Tabelle principali

```text
contrattotelefonico
telefonata
simattiva
simdisattiva
simnonattiva
```

## Gestione SIM

La struttura segue lo schema originale del progetto:

```text
simnonattiva
- codice
- tipoSIM
```

```text
simattiva
- codice
- tipoSIM
- associataA
- dataAttivazione
```

```text
simdisattiva
- codice
- tipoSIM
- eraAssociataA
- dataAttivazione
- dataDisattivazione
```

La data di disattivazione non è una scadenza futura della SIM attiva. Viene salvata solo quando la SIM viene effettivamente disattivata e passa nello storico `simdisattiva`.

## Uso

1. Creare un database MySQL.
2. Importare `schema.sql`.
3. Configurare la connessione in `back-end/config/database.php` oppure usare `back-end/config/database.local.php`.
4. Popolare le tabelle con dati coerenti.

## Nota sui vincoli

Lo schema include chiavi, indici e vincoli principali. Se l'ambiente MySQL non supporta alcuni `CHECK`, la coerenza resta gestita anche dall'applicazione PHP.
