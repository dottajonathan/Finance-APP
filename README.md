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
