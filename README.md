# MastroTraining

App web per il monitoraggio del piano di allenamento di Sofia verso la 21km di Roma (18 ottobre 2026).

**Pagina Sofia**: Vede il suo piano, gli allenamenti da Strava, annota stanchezza 1-5 + note  
**Dashboard Coach**: Vede i dati di Sofia, analisi automatiche, suggerimenti per modificare il piano  

---

## Setup (30 min totali)

### 1. Crea un progetto Firebase (5 min)

1. Vai su https://firebase.google.com
2. Clicca "Console"
3. Crea un nuovo progetto: "mastrotraining"
4. Attiva Firestore Database (mode test, per sviluppo)
5. Attiva Authentication (Email/Password)
6. Nel menu "Impostazioni progetto" → "Impostazioni generali", copia i dati:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### 2. Crea app Strava Developer (5 min)

1. Vai su https://www.strava.com/settings/api
2. Crea una nuova app:
   - Nome: "MastroTraining"
   - URL: `https://mastrotraining.vercel.app`
   - Authorization Callback Domain: `mastrotraining.vercel.app`
3. Copia:
   - Client ID
   - Client Secret

### 3. Configura le variabili d'ambiente (5 min)

1. In `mastrotraining/.env.local` (crea il file se non esiste):

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

NEXT_PUBLIC_STRAVA_CLIENT_ID=YOUR_STRAVA_CLIENT_ID
STRAVA_CLIENT_ID=YOUR_STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET=YOUR_STRAVA_CLIENT_SECRET
```

### 4. Deploy su Vercel (5 min)

1. Vai su https://vercel.com
2. Connetti il tuo GitHub (push questo codice)
3. Crea nuovo progetto da GitHub
4. Nel menu "Impostazioni" → "Environment Variables", copia le 9 variabili da `.env.local`
5. Deploy automatico ✓

### 5. Genera il link di invito per Sofia

1. Accedi a https://mastrotraining.vercel.app/dashboard con il tuo account
2. Clicca "Genera Invito"
3. Copia il link e mandalo a Sofia via WhatsApp/Email

---

## Come funziona

### Sofia (atleta)

1. Clicca il link di invito
2. Si registra con email + password
3. Autorizza Strava (OAuth)
4. Ogni sera dopo l'allenamento:
   - Vede i dati di Strava (km, ritmo, tempo)
   - Compila stanchezza (1-5 slider)
   - Aggiunge note
   - Clicca "Salva"

### Tu (coach)

1. Accedi a https://mastrotraining.vercel.app/dashboard
2. Vedi:
   - Grafico trend stanchezza (ultimi 14 giorni)
   - Stanchezza media
   - Suggerimento automatico (IN LINEA / TROPPO VELOCE / AFFATICATA / etc.)
   - Tabella dettagli con tutte le note
3. In base ai dati, decidi se:
   - Continui il piano
   - Riduci intensità
   - Aumenti carico
   - Stop per infortunio

---

## Stack Tecnologico

- **Frontend**: React 18 + Next.js 14 + TailwindCSS
- **Backend**: Firebase Functions (serverless)
- **Database**: Firestore (NoSQL)
- **Auth**: Firebase Authentication + OAuth Strava
- **Hosting**: Vercel (gratis)
- **Charts**: Recharts

---

## Struttura File

```
mastrotraining/
├── app/
│   ├── page.tsx                 # Login/Registrazione
│   ├── connect-strava/page.tsx  # OAuth Strava
│   ├── sophia/page.tsx          # Pagina Sofia (piano + form)
│   ├── dashboard/page.tsx       # Dashboard Coach (analisi)
│   ├── api/
│   │   └── strava/callback/     # API OAuth callback
│   ├── layout.tsx               # Layout root
│   └── globals.css              # CSS globale
├── lib/
│   ├── firebase/config.ts       # Config Firebase
│   └── strava/utils.ts          # Utility Strava API
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.local                   # Variabili ambiente (LOCAL)
└── .env.local.example           # Esempio

```

---

## Troubleshooting

### "Firebase not configured"
→ Controlla che le variabili d'ambiente in `.env.local` siano corrette

### "Strava callback error"
→ Verifica che Client ID, Secret, e URL di callback siano giusti in Strava Developer

### "Page not found after login"
→ L'URL di callback in Strava deve essere esattamente `https://mastrotraining.vercel.app`

---

## Maintenance

Una volta deployed, l'app è automatica:
- Sofia annota dati → Firebase salva → Dashboard aggiorna in real-time
- Zero interventi manuali necessari
- Backup automatico su Firebase

Costo mensile: €0 (Vercel free + Firebase free tier copre tranquillamente questa app)

---

## Next Steps

1. Crea Firebase project
2. Crea app Strava Developer
3. Riempi `.env.local`
4. Push su GitHub
5. Deploy su Vercel
6. Genera link per Sofia
7. Monitora il dashboard ogni 2 settimane

Fatto! L'app è viva.

---

**Created**: June 2026  
**For**: Sofia's Rome Half Marathon Training  
**Status**: Production Ready
