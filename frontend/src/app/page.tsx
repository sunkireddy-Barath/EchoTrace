import { Github, Zap, Network, Search, Layers } from 'lucide-react';
import { UploadPanel } from '@/components/UploadPanel';
import { StatsBar } from '@/components/StatsBar';

export default function HomePage() {
  return (
    <div className="min-h-screen cyber-grid">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-cyber-border bg-cyber-bg/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-cyber-text font-mono">EchoTrace AI</span>
              <span className="ml-2 text-xs bg-cyber-accent/20 text-cyber-accent px-1.5 py-0.5 rounded font-mono">
                BETA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/sunkireddy-Barath/EchoTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-cyber-muted hover:text-cyber-text text-sm transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border border-cyber-border px-3 py-1.5 rounded-lg text-cyber-muted hover:text-cyber-accent hover:border-cyber-accent/50 transition-colors font-mono"
            >
              API Docs
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* Hero */}
        <section className="text-center space-y-6 relative">
          <div className="scan-overlay">
            <div className="scan-line" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyber-accent/30 bg-cyber-accent/10 px-4 py-1.5 text-xs text-cyber-accent font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse" />
            Qdrant-Powered Semantic Intelligence
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
            <span className="text-cyber-text">Track. Trace.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent to-blue-400">
              Terminate Fraud.
            </span>
          </h1>

          <p className="text-cyber-muted text-lg max-w-2xl mx-auto leading-relaxed">
            EchoTrace uses <span className="text-cyber-accent font-semibold">Qdrant vector search</span> to detect,
            cluster, and trace the evolution of scam families — across text, screenshots, and voice messages.
            Detect fraud semantically, not with keywords.
          </p>

          <p className="text-cyber-muted/60 text-sm font-mono italic">
            &quot;Detect scam families before keywords catch them.&quot;
          </p>
        </section>

        {/* Stats */}
        <section>
          <StatsBar />
        </section>

        {/* Upload panel */}
        <section className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-cyber-text">Analyze Suspicious Content</h2>
            <p className="text-cyber-muted text-sm">
              Paste text, upload a screenshot, or submit an audio recording
            </p>
          </div>
          <UploadPanel />
        </section>

        {/* Feature strip */}
        <section>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Search className="w-6 h-6 text-cyber-accent" />,
                title: 'Semantic Search',
                desc: 'Qdrant nearest-neighbor search identifies fraud semantically — not by keywords. Same intent, different wording? Caught.',
              },
              {
                icon: <Layers className="w-6 h-6 text-blue-400" />,
                title: 'Multimodal Input',
                desc: 'Text, screenshots via EasyOCR, and voice recordings via Whisper — all converted to vectors and searched in Qdrant.',
              },
              {
                icon: <Network className="w-6 h-6 text-threat-medium" />,
                title: 'Threat Mutation Graph',
                desc: 'Interactive graph showing semantic relationships between fraud families. See how scam clusters are connected.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3 hover:border-cyber-accent/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-cyber-bg flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-cyber-text">{f.title}</h3>
                  <p className="text-cyber-muted text-sm mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cyber-muted">
          <span className="font-mono">EchoTrace AI v1.0.0</span>
          <span>
            Powered by{' '}
            <span className="text-cyber-accent">Qdrant</span> +{' '}
            <span className="text-blue-400">SentenceTransformers</span> +{' '}
            <span className="text-threat-low">FastAPI</span>
          </span>
          <span className="font-mono">Community &amp; Social Impact</span>
        </div>
      </footer>
    </div>
  );
}
