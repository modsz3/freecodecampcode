import React from 'react';
import { Link } from 'react-router-dom';
import { platformOf, formatDate } from '@/data/articles';

export function PlatformTag({ id, className = '' }) {
  const p = platformOf(id);
  if (!p) return null;
  return (
    <span
      className={`mono inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${className}`}
      style={{ color: p.accent, border: `1px solid ${p.accent}55`, background: `${p.accent}14` }}
    >
      {p.label}
    </span>
  );
}

export function PlatformTags({ platforms = [], className = '' }) {
  return (
    <>
      {platforms.map((id) => (
        <PlatformTag key={id} id={id} className={className} />
      ))}
    </>
  );
}

export default function ArticleCard({ article, variant = 'stack', index = 0 }) {
  const firstPlatform = platformOf((article.platforms || [])[0]);
  if (variant === 'row') {
    return (
      <Link to={`/article/${article.slug}`} className="group flex gap-5 border-b border-border py-6">
        <div className="mono w-8 shrink-0 pt-1 text-sm text-muted-foreground">{String(index + 1).padStart(2, '0')}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <PlatformTags platforms={article.platforms} />
            <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">{formatDate(article.date)}</span>
          </div>
          <h3 className="display mt-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary sm:text-xl">
            {article.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{article.dek}</p>
        </div>
        <div className="hidden h-24 w-36 shrink-0 overflow-hidden sm:block">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col border border-border bg-card transition-transform duration-300 hover:-translate-y-1"
      style={{ boxShadow: `6px 6px 0 0 ${firstPlatform ? firstPlatform.accent + '22' : 'transparent'}` }}
    >
      <div className="aspect-[3/2] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-3">
          <PlatformTags platforms={article.platforms} />
          <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">{article.readTime}</span>
        </div>
        <h3 className="display mt-3 text-xl font-bold leading-tight transition-colors group-hover:text-primary">{article.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{article.dek}</p>
        <p className="mono mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">
          {article.author} &middot; {formatDate(article.date)}
        </p>
      </div>
    </Link>
  );
}
