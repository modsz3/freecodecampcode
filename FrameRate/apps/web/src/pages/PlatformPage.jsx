import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { Header, Footer, Ticker } from '@/components/SiteChrome';
import ArticleCard from '@/components/ArticleCard';
import { platformOf } from '@/data/articles';
import pb from '@/lib/pocketbaseClient';

const BLURB = {
  pc: 'Benchmarks, drivers, storefronts and the hardware arms race. PC gaming news and performance reporting.',
  xbox: 'Console hardware, subscriptions, handhelds and first-party studios. Xbox news and analysis.',
  playstation: 'First-party slates, hardware revisions and the living-room experience. PlayStation news and analysis.',
};

const PlatformPage = () => {
  const { platform } = useParams();
  const p = platformOf(platform);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!p) { setLoading(false); return; }
    pb.collection('articles').getFullList({
      filter: `status = "published" && platforms ~ "${platform}"`,
      sort: '-date',
    })
      .then(setArticles)
      .catch((err) => console.error('Failed to load platform articles', err))
      .finally(() => setLoading(false));
  }, [platform, p]);

  if (!p) {
    return (
      <div className="grain flex min-h-screen flex-col">
        <Helmet>
          <title>Platform not found — EasyGamerNews</title>
          <meta name="description" content="This platform section does not exist on EasyGamerNews gaming news." />
        </Helmet>
        <Header />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
          <h1 className="display text-4xl font-black uppercase">Section not found</h1>
          <p className="mt-3 text-muted-foreground">We cover PC, Xbox and PlayStation. Try one of those.</p>
          <Link to="/" className="mono mt-6 text-[11px] uppercase tracking-widest text-primary">Back to latest</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="grain min-h-screen">
      <Helmet>
        <title>{`${p.label} Gaming News and Analysis — EasyGamerNews`}</title>
        <meta name="description" content={BLURB[p.id]} />
        <link rel="canonical" href={`/platform/${p.id}`} />
      </Helmet>
      <Header />
      <Ticker />
      <main>
        <section className="border-b border-border" style={{ background: `linear-gradient(180deg, ${p.accent}1a, transparent)` }}>
          <div className="mx-auto max-w-[90rem] px-5 py-14 lg:px-10">
            <span className="block h-1 w-16" style={{ background: p.accent }} />
            <h1 className="display mt-5 text-5xl font-black uppercase tracking-tighter sm:text-7xl">{p.label}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{BLURB[p.id]}</p>
          </div>
        </section>
        <section className="mx-auto max-w-[90rem] px-5 py-12 lg:px-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3 border border-border p-5">
                  <div className="h-40 bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <p className="border border-dashed border-border p-10 text-center text-muted-foreground">
              No stories filed in this section yet. Check back tomorrow.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.id || a.slug} article={a} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlatformPage;
