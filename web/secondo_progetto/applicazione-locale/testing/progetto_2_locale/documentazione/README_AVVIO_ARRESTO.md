# Avvio e arresto

## Avvio su Windows

1. Estrarre completamente lo ZIP.
2. Aprire la cartella `progetto_2_locale`.
3. Eseguire `AVVIA.bat`.
4. Lasciare aperte le finestre dei servizi.
5. Attendere l'apertura automatica della pagina web.

Al primo avvio serve una connessione Internet. Il launcher controlla e prepara nella cartella `.runtime` i componenti mancanti.

## Avvio su Linux o macOS

```sh
chmod +x AVVIA.sh ARRESTA.sh
./AVVIA.sh
```

## Link locali

- Importazione: `http://127.0.0.1:8080/migration-servlet/`
- Visualizzatore PostgreSQL: `http://127.0.0.1:8000/api/migration/browser/?database=DATABASE1`
- Stato Django: `http://127.0.0.1:8000/api/migration/health/`

## Connessione PostgreSQL

```text
Host: 127.0.0.1
Porta: 55432
Utente: postgres
Password: vuota
Database amministrativo: postgres
```

## Arresto

Su Windows eseguire `ARRESTA.bat`.

Su Linux o macOS eseguire:

```sh
./ARRESTA.sh
```

L'arresto chiude Django, Tomcat e PostgreSQL locale.

## Diagnostica

Su Windows eseguire `AVVIA_DIAGNOSTICA.bat`.

I log si trovano in `.runtime/logs/`.
