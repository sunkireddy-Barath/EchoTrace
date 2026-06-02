'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, LayoutDashboard, Search, Users, Radio,
  Github, BookOpen, Activity, ChevronRight,
  AlertOctagon, Network, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_MAIN = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/analyze', icon: Search, label: 'Analyze' },
  { href: '/families', icon: Users, label: 'Fraud Families' },
  { href: '/feed', icon: Radio, label: 'Live Feed' },
];

const NAV_INTEL = [
  { href: '/radar', icon: AlertOctagon, label: 'Zero-Day Radar' },
  { href: '/vectorspace', icon: Network, label: 'Vector Space' },
  { href: '/threatmap', icon: Globe, label: 'Threat Map' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col border-r border-border bg-surface z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon to-neon-2 flex items-center justify-center flex-shrink-0 glow-blue">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm text-ink font-mono tracking-wide">EchoTrace</div>
          <div className="text-xs text-ink-3">AI v2.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <div className="text-[10px] uppercase tracking-widest text-ink-3 px-3 py-2">Intelligence</div>
        {NAV_MAIN.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn('sidebar-item', active && 'active')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          );
        })}

        <div className="text-[10px] uppercase tracking-widest text-ink-3 px-3 py-2 mt-3">Threat Intel</div>
        {NAV_INTEL.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={cn('sidebar-item', active && 'active')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          );
        })}

        <div className="text-[10px] uppercase tracking-widest text-ink-3 px-3 py-2 mt-3">Resources</div>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-item"
        >
          <BookOpen className="w-4 h-4" /> API Docs
        </a>
        <a
          href="https://qdrant.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-item"
        >
          <Activity className="w-4 h-4" /> Qdrant
        </a>
        <a
          href="https://github.com/sunkireddy-Barath/EchoTrace"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-item"
        >
          <Github className="w-4 h-4" /> GitHub
        </a>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-threat-low animate-pulse flex-shrink-0" />
          <span className="text-xs text-ink-3 font-mono">Qdrant Online</span>
        </div>
        <div className="text-[10px] text-ink-3 mt-1">Powered by Qdrant + SentenceTransformers</div>
      </div>
    </aside>
  );
}
