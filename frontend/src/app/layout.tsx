import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EchoTrace AI | Semantic Fraud Intelligence Engine',
  description:
    'Detect scam families before keywords catch them. Qdrant-powered semantic search for fraud detection, evolution tracking, and threat intelligence.',
  keywords: ['fraud detection', 'scam analysis', 'semantic search', 'Qdrant', 'AI', 'threat intelligence'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-cyber-bg text-cyber-text antialiased">
        {children}
      </body>
    </html>
  );
}
