'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface TrainingEntry {
  id: string;
  date: string;
  stanchezza: number;
  note: string;
  userId: string;
  allenamento?: string;
}

interface AthleteSummary {
  name: string;
  lastEntries: TrainingEntry[];
  avgStanchezza: number;
  trend: 'up' | 'down' | 'stable';
  suggestion: string;
  status: 'in_line' | 'too_fast' | 'too_slow' | 'tired' | 'warning';
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [athletes, setAthletes] = useState<AthleteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push('/');
        return;
      }

      setUser(currentUser);

      // Carica tutti gli entry di training
      const entriesQuery = query(collection(db, 'training_entries'));
      const entriesSnap = await getDocs(entriesQuery);
      const allEntries = entriesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainingEntry[];

      // Raggruppa per utente
      const groupedByUser = new Map<string, TrainingEntry[]>();
      allEntries.forEach((entry) => {
        if (!groupedByUser.has(entry.userId)) {
          groupedByUser.set(entry.userId, []);
        }
        groupedByUser.get(entry.userId)?.push(entry);
      });

      // Calcola metriche per ogni atleta
      const summaries: AthleteSummary[] = [];
      groupedByUser.forEach((entries, userId) => {
        const last14Days = entries.filter(
          (e) => new Date(e.date) >= subDays(new Date(), 14)
        );

        if (last14Days.length === 0) return;

        const avgStanchezza = last14Days.reduce((sum, e) => sum + e.stanchezza, 0) / last14Days.length;
        const recentTrend = last14Days.slice(-3).map((e) => e.stanchezza);
        const trend = recentTrend[recentTrend.length - 1] > recentTrend[0] ? 'up' : 'down';

        let status: AthleteSummary['status'] = 'in_line';
        let suggestion = 'Tutto in linea! Continua così. ✓';

        if (avgStanchezza >= 4.5) {
          status = 'tired';
          suggestion = '⚠️ Affaticamento rilevato. RIDUCI volume del 40%. Stop ripetute per 1 sett.';
        } else if (avgStanchezza >= 4) {
          status = 'warning';
          suggestion = '⚠️ Troppo affaticata. Riduci ritmo +10sec/km, accorcia lungo 2-3km.';
        } else if (avgStanchezza <= 2) {
          status = 'too_slow';
          suggestion = '💪 Sofia è troppo fresca! Aumenta -5sec/km, +2km al lungo.';
        }

        summaries.push({
          name: userId,
          lastEntries: last14Days,
          avgStanchezza: Math.round(avgStanchezza * 10) / 10,
          trend,
          suggestion,
          status,
        });
      });

      setAthletes(summaries);

      // Prepara dati per il grafico
      if (summaries.length > 0) {
        const chartEntries = summaries[0].lastEntries
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((e) => ({
            date: format(new Date(e.date), 'dd/MM'),
            stanchezza: e.stanchezza,
          }));
        setChartData(chartEntries);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleCreateInvite = () => {
    const token = Math.random().toString(36).substring(2, 15);
    const inviteUrl = `${window.location.origin}/?token=${token}`;
    alert(`Link invito generato:\n\n${inviteUrl}\n\nCopialo e mandalo a Sofia.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const athleteData = athletes[0];

  const statusColors = {
    in_line: 'bg-green-100 border-green-500',
    too_fast: 'bg-yellow-100 border-yellow-500',
    too_slow: 'bg-blue-100 border-blue-500',
    tired: 'bg-red-100 border-red-500',
    warning: 'bg-orange-100 border-orange-500',
  };

  const statusTextColors = {
    in_line: 'text-green-800',
    too_fast: 'text-yellow-800',
    too_slow: 'text-blue-800',
    tired: 'text-red-800',
    warning: 'text-orange-800',
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">MastroTraining Coach</h1>
            <p className="text-gray-400">Dashboard di monitoraggio Sofia</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={handleCreateInvite}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
            >
              + Genera Invito
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {athleteData && (
          <>
            {/* Status Card */}
            <div
              className={`${
                statusColors[athleteData.status]
              } border-l-4 rounded-lg p-6 ${statusTextColors[athleteData.status]}`}
            >
              <h2 className="text-2xl font-bold mb-2">📊 Status Sofia</h2>
              <p className="text-lg">{athleteData.suggestion}</p>
            </div>

            {/* Metriche */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Stanchezza Media (14gg)</p>
                <p className="text-4xl font-bold text-blue-400">{athleteData.avgStanchezza}/5</p>
                <p className="text-xs text-gray-500 mt-2">
                  Target: 2.5-3.5 | {athleteData.avgStanchezza > 3.5 ? '⚠️ Alto' : '✓ Ok'}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Trend</p>
                <p className="text-3xl font-bold">
                  {athleteData.trend === 'up' ? '📈 Affaticata' : '📉 In recupero'}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Allenamenti (14gg)</p>
                <p className="text-4xl font-bold text-green-400">{athleteData.lastEntries.length}</p>
              </div>
            </div>

            {/* Grafico */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">📈 Trend Stanchezza</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis domain={[1, 5]} stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #666' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stanchezza"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    name="Stanchezza"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabella Dettagli */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">📋 Dettagli Ultimi 14 Giorni</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-4 py-3 font-bold text-gray-300">Data</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-300">Stanchezza</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-300">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athleteData.lastEntries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="px-4 py-3">
                            {format(new Date(entry.date), 'dd MMM yyyy')}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block font-bold px-3 py-1 rounded-full ${
                                entry.stanchezza >= 4
                                  ? 'bg-red-900 text-red-200'
                                  : entry.stanchezza >= 3.5
                                  ? 'bg-yellow-900 text-yellow-200'
                                  : 'bg-green-900 text-green-200'
                              }`}
                            >
                              {entry.stanchezza}/5
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{entry.note}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {athletes.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 mb-4">Nessun atleta connesso ancora.</p>
            <button
              onClick={handleCreateInvite}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
            >
              Genera Invito per Sofia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
