import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header, Footer, Ticker } from '@/components/SiteChrome';
import ArticleCard, { PlatformTag } from '@/components/ArticleCard';
import { articles, PLATFORMS, formatDate } from '@/data/articles';
const NewsletterBox = () => {
  React.useEffect(() => {
    // Load the Systeme.io embed script
    const script = document.createElement('script');
    script.id = 'form-script-tag-24940342';
    script.src = 'https://easygamersetups.systeme.io/public/remote/page/432299068613d42eab12b44f23f55f4dd36675f6.js';
    script.async = true;
    const container = document.getElementById('newsletter-embed');
    if (container) {
      container.appendChild(script);
    }
  }, []);
  return <div id="newsletter" className="mt-8 border border-border bg-card p-6">
      <p className="display text-xl font-black uppercase leading-tight">The WEEKLY brief</p>
      <p className="mt-2 text-sm text-muted-foreground">Top news headlines across PC, Xbox and PlayStation, every Wednesday morning.</p>
      <div id="newsletter-embed" className="mt-4" />
    </div>;
};
const HomePage = () => {
  const lead = articles[0];
  const secondary = articles.slice(1, 3);
  const rest = articles.slice(3);
  return <div className="grain min-h-screen">
      <Helmet>
        <title>EasyGamerNews — PC, Xbox and PlayStation Gaming News</title>
        <meta name="description" content="EasyGamerNews is an independent gaming news site covering PC, Xbox and PlayStation: daily headlines, hardware analysis, performance testing and industry reporting. No paywall, no membership." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="EasyGamerNews — PC, Xbox and PlayStation Gaming News" />
        <meta property="og:description" content="Weekly gaming news and analysis across PC, Xbox and PlayStation." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header />
      <Ticker />

      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-12 lg:grid-cols-[1.6fr_1fr] lg:px-10 lg:py-16">
            <article className="rise">
              <div className="flex flex-wrap items-center gap-3">
                <span className="mono bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  Lead story
                </span>
                <PlatformTag id={lead.platform} />
                <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {formatDate(lead.date)} &middot; {lead.readTime}
                </span>
              </div>
              <h1 className="display mt-5 text-4xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
                {lead.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{lead.dek}</p>
              <Link to={`/article/${lead.slug}`} className="mt-6 inline-flex items-center gap-2 bg-foreground px-5 py-3 display text-xs font-extrabold uppercase tracking-widest text-background transition-transform hover:-translate-y-px active:scale-[0.98]">
                Read the story <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-8 overflow-hidden border border-border">
                <img src={lead.image} alt={lead.title} className="h-full w-full object-cover" />
              </div>
            </article>

            <aside className="rise" style={{
            animationDelay: '120ms'
          }}>
              <p className="mono border-b border-border pb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                Also today
              </p>
              <div className="flex flex-col">
                {secondary.map((a, i) => <ArticleCard key={a.slug} article={a} variant="row" index={i} />)}
              </div>
              <NewsletterBox />
            </aside>
          </div>
        </section>

        <section className="border-b border-border bg-[hsl(240,10%,8%)]">
          <div className="mx-auto grid max-w-[90rem] gap-px bg-border px-0 sm:grid-cols-3">
            {PLATFORMS.map(p => {
            const count = articles.filter(a => a.platform === p.id).length;
            return <Link key={p.id} to={`/platform/${p.id}`} className="group bg-[hsl(240,10%,8%)] px-6 py-8 transition-colors hover:bg-card lg:px-10">
                  <span className="block h-1 w-12" style={{
                background: p.accent
              }} />
                  <p className="display mt-4 text-3xl font-black uppercase tracking-tighter">{p.label}</p>
                  <p className="mono mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {count} recent {count === 1 ? 'story' : 'stories'}
                  </p>
                </Link>;
          })}
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-5 py-14 lg:px-10">
          <div className="flex items-end justify-between border-b border-border pb-4">
            <h2 className="display text-2xl font-black uppercase tracking-tight sm:text-3xl">More from the desk</h2>
            <span className="mono hidden text-[11px] uppercase tracking-widest text-muted-foreground sm:block">
              Updated {formatDate(articles[0].date)}
            </span>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(a => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default HomePage;