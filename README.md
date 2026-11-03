# eSerie A Enilive – sito con live su Netlify

## Cosa contiene
- `public/index.html` – il sito completo
- `netlify/functions/live.mjs` – la funzione che salva e legge i punteggi live
- `package.json` e `netlify.toml` – configurazione (non serve toccarli)

## Come funziona
- Tutti vedono il live: la pagina chiede i punteggi ogni 15 secondi (e quando torni sulla scheda).
- Solo chi conosce la password admin può modificare. Il pannello si apre da **Live → Accesso admin**.
- Punteggio di ogni squadra = base 66 + bonus/malus degli eventi. I gol seguono le soglie 66, 72 e poi uno ogni 5 punti.

## Messa online (serve uno di questi due metodi)
Il semplice trascinamento della cartella non basta, perché la funzione ha bisogno di installare una dipendenza.

### Metodo A – GitHub (consigliato)
1. Crea un repository su GitHub (anche privato) e carica tutto il contenuto di questa cartella.
2. Su Netlify: **Add new site → Import an existing project → GitHub** e scegli il repository.
   La configurazione è già in `netlify.toml` (pubblica `public`, funzioni in `netlify/functions`).
3. In **Site configuration → Environment variables** aggiungi `ADMIN_PASSWORD` con la password scelta (lunga, non la stessa di altri servizi).
4. Fai il deploy (o **Deploys → Trigger deploy**).

### Metodo B – Netlify CLI
```
npm install -g netlify-cli
netlify login
netlify init            # crea o collega il sito
netlify env:set ADMIN_PASSWORD "la-tua-password"
netlify deploy --prod
```

## Controllo
Apri `https://IL-TUO-SITO.netlify.app/api/live`: deve rispondere `{"matches":{}}`.
Poi vai su **Live → Accesso admin** e inserisci la password.

## Uso durante la partita
1. Scegli la partita e premi **LIVE**.
2. Aggiungi gli eventi (squadra, giocatore, tipo): il punteggio e i gol si ricalcolano.
3. Con **Finale** la partita resta con il risultato; per azzerarla premi **Prepartita** ed elimina gli eventi.
4. La base 66 si può cambiare per ogni squadra.

## Aggiornare il sito (news, classifica, ecc.)
Sostituisci `public/index.html` con la nuova versione e fai un nuovo deploy (su GitHub basta un commit; con la CLI `netlify deploy --prod`). I punteggi live restano salvati.

## Note
- Per cambiare la password modifica `ADMIN_PASSWORD` su Netlify e rifai il deploy.
- Chi ha la password può modificare i punteggi: condividila solo con gli admin.
- Gli aggiornamenti arrivano ai visitatori entro circa 15 secondi, non istantaneamente.
- Se il sito esiste già e lo hai caricato trascinando una cartella, quel sito non si può collegare a GitHub: crea un nuovo sito e poi sposta il dominio, se ne usi uno personalizzato.
