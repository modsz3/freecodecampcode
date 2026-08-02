import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header, Footer } from '@/components/SiteChrome';
import ArticleCard, { PlatformTags } from '@/components/ArticleCard';
import { formatDate } from '@/data/articles';
import { fetchArticleBySlug, fetchPublishedArticles } from '@/lib/articlesApi';

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetchArticleBySlug(slug)
      .then(async (art) => {
        if (!art) { setNotFound(true); return; }
        setArticle(art);
        // Load related articles
        try {
          const all = await fetchPublishedArticles();
          const rel = all.filter(
            (a) =>
              a.slug !== art.slug &&
              (a.platforms || []).some((pid) => (art.platforms || []).includes(pid))
          ).slice(0, 3);
          setRelated(rel);
        } catch (_) {}
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="grain min-h-screen">
        <Header />
        <main className="mx-auto max-w-[56rem] px-5 py-12 lg:py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded" />
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-64 w-full bg-muted rounded" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-4 w-full bg-muted rounded" />)}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="grain flex min-h-screen flex-col">
        <Helmet>
          <title>Story not found — EasyGamerNews</title>
          <meta name="description" content="This EasyGamerNews gaming news story could not be found." />
        </Helmet>
        <Header />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
          <h1 className="display text-4xl font-black uppercase">Story not found</h1>
          <p className="mt-3 text-muted-foreground">The link may be out of date.</p>
          <Link to="/" className="mono mt-6 text-[11px] uppercase tracking-widest text-primary">Back to latest</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const bodyArr = Array.isArray(article.body) ? article.body : [];
  const tagsArr = Array.isArray(article.tags) ? article.tags : [];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.dek,
    image: article.image ? [article.image] : [],
    datePublished: article.date,
    author: [{ '@type': 'Person', name: article.author }],
    publisher: { '@type': 'Organization', name: 'EasyGamerNews' },
  };

  return (
    <div className="grain min-h-screen">
      <Helmet>
        <title>{`${article.title} — EasyGamerNews`}</title>
        <meta name="description" content={article.dek} />
        <link rel="canonical" href={`/article/${article.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.dek} />
        {article.image && <meta property="og:image" content={article.image} />}
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>
      <Header />
      <main>
        <article className="mx-auto max-w-[56rem] px-5 py-12 lg:py-16">
          <Link to="/" className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All stories
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PlatformTags platforms={article.platforms} />
            {tagsArr.map((t) => (
              <span key={t} className="mono text-[11px] uppercase tracking-widest text-muted-foreground">{t}</span>
            ))}
          </div>
          <h1 className="display mt-4 text-4xl font-black leading-[1] sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{article.dek}</p>
          <p className="mono mt-5 border-y border-border py-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            By {article.author} &middot; {formatDate(article.date)} &middot; {article.readTime} read
          </p>
          {article.image && (
            <img src={article.image} alt={article.title} className="mt-8 w-full border border-border object-cover" />
          )}
          <div className="mt-8 space-y-6">
            {bodyArr.map((para, i) => (
              <p key={i} className={`leading-[1.85] ${i === 0 ? 'text-lg' : 'text-base'} text-foreground/85`}>{para}</p>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-[90rem] px-5 py-12 lg:px-10">
              <h2 className="display border-b border-border pb-4 text-2xl font-black uppercase tracking-tight">Related coverage</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((a) => <ArticleCard key={a.id || a.slug} article={a} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;
