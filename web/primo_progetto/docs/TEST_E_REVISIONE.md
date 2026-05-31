# Test e revisione finale

## 1. Obiettivo

Questo documento raccoglie la checklist di verifica del progetto.

La checklist serve a controllare che le sezioni principali funzionino e che la struttura resti coerente prima della consegna.

## 2. Test funzionali

### Dashboard

- [ ] Caricamento riepilogo generale
- [ ] Visualizzazione card principali
- [ ] Visualizzazione grafico
- [ ] Valori proporzionati ai contenitori

### Contratti

- [ ] Visualizzazione anteprima contratti
- [ ] Apertura approfondimento contratti
- [ ] Ordinamento dei dati
- [ ] Apertura dettaglio singolo contratto
- [ ] Contenimento corretto su mobile

### Telefonate

- [ ] Visualizzazione anteprima telefonate
- [ ] Apertura approfondimento telefonate
- [ ] Filtri funzionanti
- [ ] Paginazione funzionante
- [ ] Grafico leggibile
- [ ] Valori economici visibili

### Gestione SIM

- [ ] Visualizzazione anteprima SIM
- [ ] Apertura approfondimento SIM
- [ ] Creazione SIM disattivata
- [ ] Modifica SIM disattivata
- [ ] Eliminazione SIM disattivata
- [ ] Riattivazione SIM quando prevista
- [ ] Messaggi utente chiari
- [ ] Suggerimenti nei form comprensibili

## 3. Test responsive

Controllare il progetto alle seguenti larghezze:

```text
360px
390px
768px
1024px
1440px
oltre 1440px
```

Elementi da verificare:

- [ ] header centrato
- [ ] footer contenuto
- [ ] dashboard proporzionata
- [ ] card non sovrapposte
- [ ] tabelle non fuori schermo
- [ ] modali SIM leggibili
- [ ] grafici contenuti
- [ ] testi non tagliati

## 4. Test front-end/back-end

Verificare che il flusso sia coerente:

```text
pagina
→ modulo JS pagina
→ modulo API JS
→ endpoint PHP
→ service
→ repository
→ database
→ JSON
→ render
```

Controlli:

- [ ] nessuna pagina chiama direttamente endpoint non centralizzati senza necessità
- [ ] risposte JSON leggibili dal front-end
- [ ] errori mostrati all'utente in modo comprensibile
- [ ] errori tecnici non mostrati in interfaccia

## 5. Pulizia progetto

- [ ] nessun file zip vecchio nel repository
- [ ] nessun file temporaneo
- [ ] nessun `console.log` lasciato nel codice
- [ ] nessun commento inutile
- [ ] documentazione aggiornata
- [ ] schema database presente
- [ ] configurazione locale non pubblicata

## 6. Criterio di accettazione

Il progetto è pronto quando:

```text
funziona nelle sezioni principali
è leggibile su mobile e desktop
ha codice diviso per responsabilità
ha documentazione chiara
può essere ricostruito tramite schema database
```
