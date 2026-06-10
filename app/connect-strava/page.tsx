import { Suspense } from 'react';
import ConnectStravaClient from './client';

export default function ConnectStravaPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <ConnectStravaClient />
    </Suspense>
  );
}
