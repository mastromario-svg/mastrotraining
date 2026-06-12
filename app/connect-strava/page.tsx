export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ConnectStravaClient from '@/components/ConnectStravaClient';

export default function ConnectStravaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">Caricamento...</div>}>
      <ConnectStravaClient />
    </Suspense>
  );
}
