'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function ConnectStravaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const code = searchParams.get('code');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (code && uid) {
      // Scambio il code con il token di Strava
      exchangeCode(code, uid);
    } else if (!code && uid) {
      // Primo caricamento - mostra il pulsante per autorizzare
      setStatus('waiting');
    }
  }, [code, uid]);

  const exchangeCode = async (authCode: string, userId: string) => {
    try {
      const response = await fetch('/api/strava/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode, uid: userId }),
      });

      if (!response.ok) {
        throw new Error('Errore nello scambio del token');
      }

      const data = await response.json();

      // Aggiorna Firestore con il token Strava
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          stravaAccessToken: data.access_token,
          stravaRefreshToken: data.refresh_token,
          stravaConnected: true,
          athleteId: data.athlete.id,
        });
      }

      setStatus('success');
      setTimeout(() => {
        router.push('/sophia');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleAuthorize = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/connect-strava?uid=${uid}`;
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=activity:read_all`;
    window.location.href = stravaAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Collegamento Strava...</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          </>
        )}

        {status === 'waiting' && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Collega il tuo account Strava</h1>
            <p className="text-gray-600 mb-6">
              Clicca il pulsante sotto per autorizzare l'app ad accedere ai tuoi allenamenti.
            </p>
            <button
              onClick={handleAuthorize}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Autorizza con Strava
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">✓ Connesso!</h1>
            <p className="text-gray-600 mb-4">
              Strava è stato collegato con successo. Verrai reindirizzato...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">✗ Errore</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleAuthorize}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Riprova
            </button>
          </>
        )}
      </div>
    </div>
  );
}
