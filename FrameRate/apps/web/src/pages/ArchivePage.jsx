import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Archive } from 'lucide-react';
import { Header, Footer, Ticker } from '@/components/SiteChrome';
import ArticleCard from '@/components/ArticleCard';
import { fetchArchivedArticles } from '@/lib/articlesApi';

const PAGE_SIZE = 10;

const ArchivePage = () => {
  const [all, setAll] = useState([]);
  const [visible, setVisible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchArchivedArticles()
      .then((articles) => {
        setAll(articles);
        setVisible(articles.slice(0, PAGE_SIZE));
      })
      .catch((err) => console.error('Failed to load archived articles', err))
      .finally(() => setLoading(false));
  }, []);

  const showMore = () => {
    const next = count + PAGE_SIZE;
    setCount(next);
    setVisible(all.slice(0, next));
  };

  const hasMore = visible.length < all.length;

  return (
    <div className="grain min-h-screen">
      <Helmet>
        <title>Archive — EasyGamerNews</title>
        <meta name="description" content="Browse the EasyGamerNews archive of past gaming news and analysis across PC, Xbox and PlayStation — every story from previous weekly batches." />
        <link rel="canonical" href="/archive" />
      </Helmet>
      <Header />
      <Ticker />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-[90rem] px-5 py-14 lg:px-10">
            <span className="block h-1 w-16 bg-primary" />
            <h1 className="display mt-5 text-5xl font-black uppercase tracking-tighter sm:text-7xl">Archive</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Every story from previous weekly batches. PC, Xbox and PlayStation coverage, sorted newest first.
            </p>
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
          ) : visible.length === 0 ? (
            <p className="border border-dashed border-border p-10 text-center text-muted-foreground">
              No archived stories yet. Once new weekly batches are published, older stories will appear here.
            </p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((a) => (
                  <ArticleCard key={a.id || a.slug} article={a} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={showMore}
                    className="inline-flex items-center gap-2 bg-foreground px-6 py-3 display text-xs font-extrabold uppercase tracking-widest text-background transition-transform hover:-translate-y-px active:scale-[0.98]"
                  >
                    <Archive className="h-4 w-4" /> Show more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ArchivePage;
