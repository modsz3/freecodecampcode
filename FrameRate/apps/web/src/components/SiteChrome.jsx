import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Gamepad2 } from 'lucide-react';
import { PLATFORMS } from '@/data/articles';

const SYSTEME_SCRIPT_ID = 'form-script-tag-24940342';
const SYSTEME_SCRIPT_SRC = 'https://easygamersetups.systeme.io/public/remote/page/43240651ef2431140a209af483eecfe0748efd3b.js';

function NewsletterModal({ open, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.id = SYSTEME_SCRIPT_ID;
    script.src = SYSTEME_SCRIPT_SRC;
    script.async = true;
    container.appendChild(script);

    return () => {
      const existing = document.getElementById(SYSTEME_SCRIPT_ID);
      if (existing) existing.remove();
      const iframes = container.querySelectorAll('iframe');
      iframes.forEach(f => f.remove());
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="display text-2xl font-black uppercase leading-tight">The WEEKLY brief</p>
        <p className="mt-2 text-sm text-muted-foreground">Top headlines across PC, Xbox and PlayStation, every weekday morning.</p>
        <div className="mt-3" ref={containerRef} />
      </div>
    </div>
  );
}

export function Ticker({ headlines = [] }) {
  const items = [...headlines, ...headlines];
  return (
    <div className="border-y border-border bg-[hsl(240,10%,8%)] overflow-hidden">
      <div className="flex w-max animate-ticker">
        {items.map((t, i) => (
          <span key={i} className="mono flex items-center gap-3 whitespace-nowrap px-6 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 bg-primary" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const link = ({ isActive }) =>
    `display text-sm font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <>
      <NewsletterModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-6 px-5 py-4 lg:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center bg-primary text-primary-foreground">
              <Gamepad2 className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="display text-xl font-black uppercase tracking-tighter">EasyGamerNews</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink to="/" end className={link}>Latest</NavLink>
            {PLATFORMS.map(p => (
              <NavLink key={p.id} to={`/platform/${p.id}`} className={link}>{p.label}</NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="hidden bg-foreground px-4 py-2.5 display text-xs font-extrabold uppercase tracking-wider text-background transition-transform hover:-translate-y-px active:scale-[0.98] md:inline-block"
          >
            WEEKLY brief
          </button>
          <button type="button" aria-label="Toggle menu" onClick={() => setMenuOpen(v => !v)} className="grid h-11 w-11 place-items-center border border-border md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border md:hidden">
            <nav className="flex flex-col px-5 py-3">
              <NavLink to="/" end onClick={() => setMenuOpen(false)} className="display py-3 text-base font-bold uppercase">Latest</NavLink>
              {PLATFORMS.map(p => (
                <NavLink key={p.id} to={`/platform/${p.id}`} onClick={() => setMenuOpen(false)} className="display py-3 text-base font-bold uppercase">
                  {p.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setModalOpen(true); }}
                className="text-left display py-3 text-base font-bold uppercase"
              >
                WEEKLY brief
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-[hsl(240,10%,8%)]">
      <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <p className="display text-2xl font-black uppercase tracking-tighter">EasyGamerNews</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Independent gaming news and analysis for PC, Xbox and PlayStation players.</p>
        </div>
        <div>
          <p className="mono text-[11px] uppercase tracking-widest text-muted-foreground">Platforms</p>
          <ul className="mt-3 space-y-2 text-sm">
            {PLATFORMS.map(p => <li key={p.id}><Link className="hover:text-primary" to={`/platform/${p.id}`}>{p.label} news</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="mono text-[11px] uppercase tracking-widest text-muted-foreground">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>support@easygamernews.com</li>
            <li>{/* PLACEHOLDER: replace with real contact address before launch */}Editorial desk, Manchester UK</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-5 text-center mono text-[11px] uppercase tracking-widest text-muted-foreground lg:px-10">
        &copy; {new Date().getFullYear()} EasyGamerNews. All rights reserved.
      </div>
    </footer>
  );
}
