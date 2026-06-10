'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStravaActivities, metersToKm, speedToMinPerKm, secondsToTime } from '@/lib/strava/utils';
import { format, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';

interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  type: string;
  start_date: string;
  average_speed: number;
}

interface TrainingEntry {
  id: string;
  date: string;
  allenamento: string;
  stanchezza: number;
  note: string;
  stravaActivity?: Activity;
}

export default function SophiaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stanchezza, setStanchezza] = useState(3);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [weekPlan, setWeekPlan] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push('/');
        return;
      }

      // Carica i dati dell'utente
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        router.push('/');
        return;
      }

      const userData = userDoc.data();
      setUser({ uid: currentUser.uid, ...userData });

      // Se Strava è collegato, carica gli allenamenti
      if (userData.stravaConnected && userData.stravaAccessToken) {
        try {
          const stravaActivities = await getStravaActivities(userData.stravaAccessToken, 20);
          setActivities(stravaActivities);
        } catch (err) {
          console.error('Error loading Strava activities:', err);
        }
      }

      // Carica gli entry di allenamento dell'utente
      const entriesQuery = query(
        collection(db, 'training_entries'),
        where('userId', '==', currentUser.uid)
      );
      const entriesSnap = await getDocs(entriesQuery);
      const loadedEntries = entriesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainingEntry[];
      setEntries(loadedEntries);

      // Carica il piano di allenamento
      loadWeekPlan();

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadWeekPlan = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: it, weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { locale: it, weekStartsOn: 1 });

    // Piano di Sofia (giugno settimana 2)
    const plan = [
      { day: 'Lunedì', allenamento: 'RIPETUTE: 6x1000m a 4:50', km: 9 },
      { day: 'Mercoledì', allenamento: 'MEDIO: 10km a 5:15', km: 10 },
      { day: 'Venerdì', allenamento: 'LUNGO PROGRESSIVO: 13km', km: 13 },
    ];

    setWeekPlan(plan);
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'training_entries'), {
        userId: user.uid,
        date: format(new Date(), 'yyyy-MM-dd'),
        stanchezza,
        note,
        timestamp: serverTimestamp(),
      });

      setStanchezza(3);
      setNote('');

      // Ricarica gli entry
      const entriesQuery = query(
        collection(db, 'training_entries'),
        where('userId', '==', user.uid)
      );
      const entriesSnap = await getDocs(entriesQuery);
      const loadedEntries = entriesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainingEntry[];
      setEntries(loadedEntries);
    } catch (err) {
      console.error('Error submitting entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const todayActivity = activities.find((a) =>
    isToday(new Date(a.start_date))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">MastroTraining</h1>
            <p className="text-blue-100">Ciao Sofia! 🏃‍♀️</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Piano settimanale */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Piano questa settimana</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weekPlan.map((item, idx) => (
              <div
                key={idx}
                className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded"
              >
                <p className="font-bold text-gray-800">{item.day}</p>
                <p className="text-sm text-gray-600">{item.allenamento}</p>
                <p className="text-xs text-gray-500 mt-2">{item.km}km</p>
              </div>
            ))}
          </div>
        </div>

        {/* Allenamento di oggi da Strava */}
        {todayActivity && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🏃 Allenamento di oggi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Distanza</p>
                <p className="text-2xl font-bold text-gray-800">{metersToKm(todayActivity.distance)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ritmo</p>
                <p className="text-2xl font-bold text-gray-800">{speedToMinPerKm(todayActivity.average_speed)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo</p>
                <p className="text-2xl font-bold text-gray-800">{secondsToTime(todayActivity.moving_time)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="text-2xl font-bold text-gray-800">{todayActivity.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form sensazioni */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">😊 Come ti senti?</h2>
          <form onSubmit={handleSubmitEntry} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stanchezza (1-5)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={stanchezza}
                  onChange={(e) => setStanchezza(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-3xl font-bold text-blue-500 w-12 text-center">
                  {stanchezza}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                1=Morta | 2=Stanca | 3=Normale | 4=Fresca | 5=Molto fresca
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Come è andato? Qualche dolore? Troppo caldo?"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Salvataggio...' : 'Salva sensazioni'}
            </button>
          </form>
        </div>

        {/* Storico */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Storico</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-2 font-bold">Data</th>
                  <th className="text-left px-4 py-2 font-bold">Stanchezza</th>
                  <th className="text-left px-4 py-2 font-bold">Note</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice().reverse().map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{format(new Date(entry.date), 'dd MMM', { locale: it })}</td>
                    <td className="px-4 py-2">
                      <span className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">
                        {entry.stanchezza}/5
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
