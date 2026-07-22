# API di esportazione del database

Questa estensione è isolata dal resto della web app e aggiunge soltanto endpoint di lettura JSON.
Nessun file preesistente è stato modificato.

## Struttura aggiunta

```text
back-end/api/migration/
  index.php
  get-manifest.php
  export-resource.php
back-end/repositories/migration/
  migrationExportRepository.php
back-end/services/migration/
  migrationExportService.php
```

## Endpoint

### Manifest

```http
GET /back-end/api/migration/get-manifest.php
```

Restituisce versione dello schema, risorse disponibili e numero di record per ogni risorsa.

### Esportazione paginata

```http
GET /back-end/api/migration/export-resource.php?resource=contratti&limit=1000&offset=0
```

Risorse ammesse:

- `contratti`
- `simAttive`
- `simDisattive`
- `simNonAttive`
- `telefonate`

`limit` è compreso tra 1 e 5000. `offset` parte da 0. La risposta contiene `hasNext` e `nextOffset`.

## Ordine consigliato di importazione locale

1. `contratti`
2. `simAttive`
3. `simDisattive`
4. `simNonAttive`
5. `telefonate`

L'ordine consente al database PostgreSQL locale di creare prima i contratti e poi i dati che li referenziano.
