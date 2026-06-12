export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import LoginClient from '@/components/LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">Caricamento...</div>}>
      <LoginClient />
    </Suspense>
  );
}
