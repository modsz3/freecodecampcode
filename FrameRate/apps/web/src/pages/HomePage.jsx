import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header, Footer, Ticker } from '@/components/SiteChrome';
import ArticleCard, { PlatformTags } from '@/components/ArticleCard';
import { PLATFORMS, formatDate } from '@/data/articles';
import { fetchPublishedArticles, fetchCurrentBatchArticles } from '@/lib/articlesApi';

const ArticleSkeleton = () => (
  <div className="animate-pulse space-y-3 border-b border-border py-4">
    <div className="h-3 w-16 bg-muted rounded" />
    <div className="h-5 w-full bg-muted rounded" />
    <div className="h-4 w-2/3 bg-muted rounded" />
  </div>
);

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPublishedArticles(), fetchCurrentBatchArticles()])
      .then(([all, batch]) => {
        setArticles(all);
        setCurrentBatch(batch);
      })
      .catch((err) => console.error('Failed to load articles', err))
      .finally(() => setLoading(false));
  }, []);

  // Lead story and "also this week" pull only from the current (most recent)
  // publishing batch. "More from the desk" still uses all published articles.
  const lead = currentBatch[0];
  const MAX_SECONDARY = 10;
  const secondary = currentBatch.slice(1, 1 + MAX_SECONDARY);
  const rest = articles.slice(3);
  const tickerHeadlines = articles.slice(0, 8).map((a) => a.title);

  return (
    <div className="grain min-h-screen">
      <Helmet>
        <title>EasyGamerNews — PC, Xbox and PlayStation Gaming News</title>
        <meta name="description" content="EasyGamerNews is a free gaming news site covering PC, Xbox and PlayStation: daily headlines, hardware analysis, performance testing and industry reporting. No paywall, no membership." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="EasyGamerNews — PC, Xbox and PlayStation Gaming News" />
        <meta property="og:description" content="Free daily gaming news and analysis across PC, Xbox and PlayStation." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header />
      <Ticker headlines={tickerHeadlines} />

      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-12 lg:grid-cols-[1.6fr_1fr] lg:px-10 lg:py-16">
            {loading ? (
              <>
                <div className="animate-pulse space-y-6">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="space-y-3">
                    <div className="h-16 w-full bg-muted rounded" />
                    <div className="h-16 w-4/5 bg-muted rounded" />
                  </div>
                  <div className="h-64 w-full bg-muted rounded" />
                </div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <ArticleSkeleton key={i} />)}
                </div>
              </>
            ) : lead ? (
              <>
                <article className="rise">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="mono bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      Lead story
                    </span>
                    <PlatformTags platforms={lead.platforms} />
                    <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {formatDate(lead.date)} &middot; {lead.readTime}
                    </span>
                  </div>
                  <h1 className="display mt-5 text-4xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
                    {lead.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{lead.dek}</p>
                  <Link
                    to={`/article/${lead.slug}`}
                    className="mt-6 inline-flex items-center gap-2 bg-foreground px-5 py-3 display text-xs font-extrabold uppercase tracking-widest text-background transition-transform hover:-translate-y-px active:scale-[0.98]"
                  >
                    Read the story <ArrowRight className="h-4 w-4" />
                  </Link>
                  {lead.image && (
                    <div className="mt-8 overflow-hidden border border-border">
                      <img src={lead.image} alt={lead.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                </article>

                <aside className="rise" style={{ animationDelay: '120ms' }}>
                  <p className="mono border-b border-border pb-3 text-[11px] uppercase tracking-widest text-muted-foreground">Also THIS WEEK</p>
                  <div className="flex flex-col">
                    {secondary.map((a, i) => (
                      <ArticleCard key={a.id || a.slug} article={a} variant="row" index={i} />
                    ))}
                  </div>
                </aside>
              </>
            ) : (
              <div className="col-span-2 py-20 text-center">
                <p className="text-muted-foreground">No articles published yet.</p>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(240,10%,8%)]">
          <div className="mx-auto grid max-w-[90rem] gap-px bg-border px-0 sm:grid-cols-3">
            {PLATFORMS.map((p) => {
              const count = articles.filter((a) => (a.platforms || []).includes(p.id)).length;
              return (
                <Link
                  key={p.id}
                  to={`/platform/${p.id}`}
                  className="group bg-[hsl(240,10%,8%)] px-6 py-8 transition-colors hover:bg-card lg:px-10"
                >
                  <span className="block h-1 w-12" style={{ background: p.accent }} />
                  <p className="display mt-4 text-3xl font-black uppercase tracking-tighter">{p.label}</p>
                  <p className="mono mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {count} recent {count === 1 ? 'story' : 'stories'}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {rest.length > 0 && (
          <section className="mx-auto max-w-[90rem] px-5 py-14 lg:px-10">
            <div className="flex items-end justify-between border-b border-border pb-4">
              <h2 className="display text-2xl font-black uppercase tracking-tight sm:text-3xl">More from the desk</h2>
              {articles[0] && (
                <span className="mono hidden text-[11px] uppercase tracking-widest text-muted-foreground sm:block">
                  Updated {formatDate(articles[0].date)}
                </span>
              )}
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a.id || a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
