import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'EchoTrace AI | Semantic Fraud Intelligence Engine',
  description:
    'Detect scam families before keywords catch them. Qdrant-powered semantic genome analysis, zero-day fraud detection, and evolution velocity tracking.',
  keywords: ['fraud detection', 'scam analysis', 'semantic search', 'Qdrant', 'AI', 'threat intelligence', 'zero-day'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-void text-ink antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
