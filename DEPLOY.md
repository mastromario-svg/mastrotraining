# 🚀 QUICK START DEPLOY - MASTROTRAINING

**Tempo totale**: 30 minuti

---

## STEP 1: Firebase Setup (5 min)

1. Vai a https://firebase.google.com → Console
2. Crea progetto "mastrotraining"
3. Attiva **Firestore Database** (Test mode)
4. Attiva **Authentication** (Email/Password)
5. **Impostazioni progetto** → Copia questi 6 valori:
   ```
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId
   ```

---

## STEP 2: Strava Developer (5 min)

1. Vai a https://www.strava.com/settings/api
2. **Crea nuova app**:
   - Nome: "MastroTraining"
   - URL: `https://mastrotraining.vercel.app`
   - Callback: `mastrotraining.vercel.app`
3. Copia:
   ```
   - Client ID
   - Client Secret
   ```

---

## STEP 3: Crea `.env.local` (2 min)

Nella root di `mastrotraining/`, crea il file `.env.local` e incolla:

```
NEXT_PUBLIC_FIREBASE_API_KEY=PASTE_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=PASTE_HERE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=PASTE_HERE
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=PASTE_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=PASTE_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=PASTE_HERE

NEXT_PUBLIC_STRAVA_CLIENT_ID=PASTE_HERE
STRAVA_CLIENT_ID=PASTE_HERE
STRAVA_CLIENT_SECRET=PASTE_HERE
```

---

## STEP 4: GitHub + Deploy (10 min)

### A. Push su GitHub

```bash
cd mastrotraining
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mastrotraining.git
git push -u origin main
```

### B. Deploy su Vercel

1. Vai a https://vercel.com → Sign in con GitHub
2. **Crea nuovo progetto** → Seleziona `mastrotraining` repo
3. **Environment Variables**:
   - Copia le 9 variabili da `.env.local`
   - Incolla in Vercel → **Environment Variables** → Aggiungi tutte
4. **Deploy** → Attendi 2 min ✓

**URL**: `https://mastrotraining.vercel.app`

---

## STEP 5: Crea account coach (2 min)

1. Vai a https://mastrotraining.vercel.app
2. **Registrati** con una password (no link di invito richiesto)
3. Accedi a `/dashboard`

---

## STEP 6: Genera link per Sofia (1 min)

1. Nella dashboard, clicca **"Genera Invito"**
2. Copia il link: `https://mastrotraining.vercel.app/?token=ABC123`
3. Mandalo a Sofia via WhatsApp/Email

---

## STEP 7: Sofia si registra (2 min)

Sofia:
1. Clicca il link
2. Sceglie email + password
3. Clicca "Autorizza con Strava"
4. Autorizza l'app su Strava
5. **Fatto!** Vede la sua pagina con il piano

---

## ✅ FINITO!

- **Tu**: Accedi a `/dashboard` ogni 2 settimane
- **Sofia**: Annota stanchezza + note ogni sera
- **App**: Calcola automaticamente i suggerimenti

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| "Firebase not initialized" | Controlla che `.env.local` sia caricato in Vercel |
| "Strava login fails" | Verifica URL di callback in Strava settings |
| "Cannot find module" | Fai `npm install` in locale prima di pushare |

---

**Domande?** Controlla il README.md per dettagli completi.

Buona fortuna! 🚀
