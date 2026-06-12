import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MastroTraining',
  description: 'Piano allenamento personalizzato con monitoraggio real-time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
