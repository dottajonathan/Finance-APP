# Le Mie Finanze — PWA offline + APK

App autonoma, zero dipendenze esterne: dati in `localStorage`, riconoscimento vocale interpretato localmente, backup tramite file esportabile/importabile (nessun account, nessun servizio esterno).

---

## 1. Pubblica la PWA (HTTPS obbligatorio)

Serve per i service worker (installabilità e uso offline).

**Netlify Drop** (nessun account, per una prova rapida)
1. https://app.netlify.com/drop → trascina questa cartella
2. Ottieni un link `https://...netlify.app` in pochi secondi

**GitHub Pages** (più adatto per un uso stabile, l'URL non cambia)
1. Crea un repository, carica questi file nella root
2. Impostazioni → Pages → Deploy from branch → `main` / root
3. Sito su `https://tuonome.github.io/nome-repo/`

Annota il dominio: ti serve al Passo 5.

---

## 2. Backup dei dati

Scheda **Backup** nell'app:
- **Esporta backup** → scarica un file `finanze-backup-AAAA-MM-GG.json` con tutti i movimenti e le categorie. Mettilo dove preferisci: Google Drive, email a te stesso, chiavetta, un altro cloud.
- **Importa backup** → seleziona un file esportato in precedenza per ripristinare i dati (chiede conferma prima di sovrascrivere quelli attuali).

Nessuna configurazione richiesta, funziona anche completamente offline.

---

## 3. Creare l'APK — guida passo per passo (Windows)

Questa parte va fatta sul tuo computer Windows: qui non riesco a farla, la rete di questo ambiente blocca i siti Google necessari. Segui i passaggi nell'ordine, uno alla volta.

### PARTE 1 — Installare gli strumenti (una volta sola)

**Passo 1 — Installa Node.js**
1. Vai su https://nodejs.org
2. Clicca il bottone grande con scritto "LTS" per scaricare l'installer per Windows
3. Apri il file scaricato (nella cartella Download, tipo `node-v22.x.x-x64.msi`)
4. Clicca "Next" più volte accettando le opzioni predefinite, poi "Install", poi "Finish"
5. Premi il tasto Windows sulla tastiera, scrivi `cmd`, premi Invio: si apre una finestra nera. È il "terminale": è lì che scriveremo tutti i comandi di questa guida
6. In quella finestra scrivi `node -v` e premi Invio: deve apparire un numero come `v22.14.0`. Se dice che il comando non è riconosciuto, chiudi la finestra, aprine una nuova e riprova

**Passo 2 — Installa Java (JDK)**
Bubblewrap (lo strumento che useremo) può scaricare Java da solo, ma spesso quel download automatico si blocca con un errore poco chiaro — meglio installarlo noi una volta per tutte.
1. Vai su https://adoptium.net
2. Assicurati di scaricare la versione **17** per Windows, file `.msi` (non `.zip`)
3. Apri il file scaricato. Durante l'installazione vedrai delle opzioni con voci come "Add to PATH" e "Set JAVA_HOME": assicurati che siano selezionate per l'installazione (di norma lo sono già di default) — sono importanti
4. Chiudi ed riapri la finestra nera (stesso motivo di prima)
5. Scrivi `java -version` e premi Invio: deve apparire `openjdk version "17...`. Se non funziona, riavvia il computer e riprova

**Passo 3 — Installa Bubblewrap**
Nella finestra nera, scrivi:
```
npm i -g @bubblewrap/cli
```
Premi Invio, attendi il completamento (qualche scritta gialla "warn" è normale).

### PARTE 2 — Creare il progetto e generare l'APK

**Passo 4 — Crea una cartella per il progetto**
1. Apri Esplora File (tasto Windows + E)
2. Vai sul Desktop, tasto destro in uno spazio vuoto → Nuovo → Cartella, chiamala `finanze-android`
3. Apri quella cartella con un doppio click
4. Clicca nella barra dell'indirizzo in alto, scrivi `cmd`, premi Invio: si apre una finestra nera già dentro quella cartella

**Passo 5 — Avvia il progetto**
Scrivi (con il tuo indirizzo reale del Passo 1 della sezione precedente):
```
bubblewrap init --manifest https://tuodominio/manifest.json
```
Risponde a una serie di domande:
- *"Do you want Bubblewrap to install the JDK?"* → scrivi `n`. Quando chiede il percorso, scrivi quello di Adoptium, tipo `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` (apri quella cartella in Esplora File per vedere il nome esatto)
- *"Do you want Bubblewrap to install the Android SDK?"* → scrivi `y` (qui va bene farlo scaricare da solo, è un file grosso, ci vuole qualche minuto)
- Licenza Android → `y`
- Domande sui dettagli dell'app (nome, colori, pacchetto...) → premi Invio per accettare i valori già proposti tra parentesi
- Dati per la chiave di firma (nome, città, ecc. — quello che vuoi) e una **password**: scrivila da parte in un posto sicuro. Senza quella password non potrai più aggiornare questa app in futuro

**Passo 6 — Genera l'APK**
```
bubblewrap build
```
Chiede la password del keystore (scelta al passo prima — non la vedrai scritta mentre la digiti, è normale). Se chiede di installare gli Android Build Tools, `y`. Al termine, in Esplora File dentro la cartella `finanze-android` trovi **`app-release-signed.apk`**: è il file dell'app.

### PARTE 3 — Farla aprire come app vera, senza barra del browser (facoltativo)

Senza questo passaggio l'app funziona comunque, solo che mostra la barra degli indirizzi in alto.

**Passo 7 — Trova l'impronta della chiave**
Nella stessa finestra:
```
keytool -list -v -keystore android.keystore -alias android
```
Password di nuovo. Cerca la riga `SHA256:` nel risultato e copia il valore per intero.

**Passo 8 — Completa assetlinks.json**
1. Nella cartella della PWA (quella pubblicata, non `finanze-android`), apri `.well-known\assetlinks.json` col Blocco Note (tasto destro → Apri con → Blocco note)
2. Sostituisci il primo segnaposto con il valore di `packageId` che trovi in `finanze-android\twa-manifest.json`
3. Sostituisci il secondo segnaposto con l'impronta del Passo 7
4. Salva e ridistribuisci il sito (di nuovo Netlify Drop o GitHub)

### PARTE 4 — Installarla sul telefono (Android 15)

**Passo 9 — Trasferisci l'APK**
Il più semplice: carica `app-release-signed.apk` su Google Drive dal PC, poi scaricalo dall'app Google Drive sul telefono. In alternativa un cavo USB. Evita l'email: molti provider bloccano gli allegati .apk.

**Passo 10 — Installa**
1. Sul telefono tocca il file scaricato
2. Se compare un avviso di sicurezza, tocca "Impostazioni" nell'avviso, attiva "Consenti da questa origine", torna indietro e tocca di nuovo il file
3. Tocca Installa, poi Apri

Se un passaggio dà un errore diverso da quanto descritto qui, copia il messaggio esatto e lo risolviamo insieme.

---

## Cosa è cambiato rispetto alla versione con Google Drive

- Rimossi `config.js`, `drive.js` e lo script di Google Identity Services: nessuna configurazione su Google Cloud Console richiesta
- La scheda **Backup** ora esporta/importa un file locale invece di collegarsi a Drive
- Tutto il resto (voce, categorie, dashboard) è invariato

## Novità: andamento nel tempo, ricorrenze, obiettivi di risparmio

- **Andamento ultimi 6 mesi**: scheda Riepilogo, sotto i budget — un grafico a barre che confronta entrate e uscite mese per mese, per vedere se la tendenza generale migliora nel tempo.
- **Spese ed entrate ricorrenti**: scheda Categorie, in fondo — imposta affitto, bollette, abbonamenti, stipendio con importo e giorno del mese. Quando è il momento, un promemoria compare in cima alla scheda Aggiungi con due tocchi: "Segna" (precompila il form da confermare) o "Salta" (rimanda al mese prossimo senza registrare nulla). L'importo non viene mai inserito automaticamente senza controllo: resta sempre una conferma attiva, non un'azione silenziosa dell'app.
- **Obiettivi di risparmio**: scheda Riepilogo, in fondo — diversi dai budget (che limitano la spesa), sono traguardi da raggiungere: un nome, un importo target, una scadenza opzionale. Si alimentano con contributi manuali ("+ Aggiungi risparmio"), non vengono dedotti automaticamente dal saldo.

## Novità: onboarding e animazioni

- **Onboarding**: alla primissima apertura (solo se non ci sono ancora movimenti salvati) compare una breve presentazione in 3 schermate, saltabile in ogni momento. Chi aggiorna l'app avendo già dei dati non la vede: è pensata solo per chi parte da zero. Si può rivedere in qualsiasi momento dalla scheda Backup, pulsante "Rivedi il tour introduttivo".
- **Animazioni**: le barre di budget si riempiono invece di apparire già piene, i movimenti compaiono con un leggero effetto di ingresso, e lo stato "nessun movimento" è ora più curato e invita ad aggiungere il primo. Tutte le animazioni rispettano l'impostazione di sistema "riduci movimento", se attiva sul telefono.

## Novità: tema scuro, ricerca, categorie personalizzate

- **Tema scuro**: pulsante sole/luna nell'header, in alto a destra. Ricorda la scelta; se non ne fai una, segue l'impostazione del telefono.
- **Ricerca**: scheda Movimenti, casella in cima — filtra per descrizione, categoria o sottocategoria mentre scrivi.
- **Categorie personalizzate**: nella scheda Categorie, toccando il nome di una categoria si apre un selettore di icona (16 a scelta) e colore. Il colore scelto si riflette anche nella lista movimenti e nel grafico a torta.

## Novità: promemoria, streak e budget

- **Promemoria/streak**: ogni volta che si apre l'app (scheda Aggiungi), un banner in cima ricorda se manca ancora il movimento di oggi, con il conteggio dei giorni consecutivi. Non sono notifiche del telefono: richiederebbero un server esterno che questa app, volutamente, non ha.
- **Budget per categoria**: nella scheda Categorie, sotto ogni categoria di spesa c'è un campo "Budget mensile". Impostandolo, nella scheda Riepilogo (periodo "Questo mese") compare una barra di avanzamento, e dopo aver salvato una spesa che si avvicina o supera il limite compare un messaggio contestuale.
- **Traguardi**: scheda Riepilogo, in fondo. Si sbloccano registrando movimenti, mantenendo uno streak, o impostando budget — con un messaggio nel tono ironico-incoraggiante quando se ne sblocca uno nuovo.
- **Consiglio del giorno**: scheda Riepilogo, cambia ogni giorno e tiene conto di quale categoria pesa di più nel mese in corso.

## Aggiornare l'app dopo una modifica

Per modifiche solo al codice (non all'icona o al nome dell'app), **non serve rifare la procedura Bubblewrap**: basta ripubblicare questa cartella aggiornata sullo stesso hosting (stesso link di prima). L'app già installata sul telefono carica il sito dal vivo e si aggiorna da sola al successivo avvio (grazie al service worker, che rileva la nuova versione).
