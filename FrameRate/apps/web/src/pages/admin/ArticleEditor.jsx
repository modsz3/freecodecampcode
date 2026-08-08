import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Gamepad2, Save } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { createArticle, updateArticle } from '@/lib/articlesApi';
import { PLATFORMS } from '@/data/articles';

const slugify = (str) =>
  str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const EMPTY = {
  title: '',
  slug: '',
  dek: '',
  body: '',
  image: '',
  author: '',
  date: new Date().toISOString().slice(0, 10),
  readTime: '',
  tags: '',
  platforms: [],
  status: 'draft',
  batch: '',
};

const ArticleEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    pb.collection('articles').getOne(id)
      .then((rec) => {
        setForm({
          title: rec.title || '',
          slug: rec.slug || '',
          dek: rec.dek || '',
          body: Array.isArray(rec.body) ? rec.body.join('\n\n') : (rec.body || ''),
          image: rec.image || '',
          author: rec.author || '',
          date: rec.date || '',
          readTime: rec.readTime || '',
          tags: Array.isArray(rec.tags) ? rec.tags.join(', ') : (rec.tags || ''),
          platforms: Array.isArray(rec.platforms) ? rec.platforms : [],
          status: rec.status || 'draft',
          batch: rec.batch || '',
        });
      })
      .catch((err) => setError('Failed to load article: ' + err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'title' && !isEditing) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  const togglePlatform = (pid) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(pid)
        ? prev.platforms.filter((p) => p !== pid)
        : [...prev.platforms, pid],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const bodyArr = form.body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      const tagsArr = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = {
        title: form.title,
        slug: form.slug,
        dek: form.dek,
        body: bodyArr,
        image: form.image,
        author: form.author,
        date: form.date,
        readTime: form.readTime,
        tags: tagsArr,
        platforms: form.platforms,
        status: form.status,
        batch: form.batch,
      };
      if (isEditing) {
        await updateArticle(id, payload);
      } else {
        await createArticle(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isEditing ? 'Edit Article' : 'New Article'} — EasyGamerNews Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[72rem] items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center bg-primary text-primary-foreground">
              <Gamepad2 className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="display text-lg font-black uppercase tracking-tighter">
              {isEditing ? 'Edit Article' : 'New Article'}
            </span>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-2 mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All articles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[72rem] px-5 py-10 lg:px-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              required
              className="w-full border border-border bg-card px-4 py-3 text-lg display font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder="Article headline"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={set('slug')}
              required
              className="w-full border border-border bg-card px-4 py-2.5 mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder="url-safe-slug"
            />
          </div>

          {/* Dek / Description */}
          <div>
            <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Description / Dek</label>
            <textarea
              value={form.dek}
              onChange={set('dek')}
              rows={2}
              className="w-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
              placeholder="A short summary shown on article cards and in meta tags"
            />
          </div>

          {/* Body */}
          <div>
            <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">
              Content — separate paragraphs with a blank line
            </label>
            <textarea
              value={form.body}
              onChange={set('body')}
              rows={14}
              className="w-full border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-y"
              placeholder="Write your article here. Leave a blank line between each paragraph."
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Image URL</label>
            <input
              type="url"
              value={form.image}
              onChange={set('image')}
              className="w-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder="https://..."
            />
            {form.image && (
              <img src={form.image} alt="preview" className="mt-3 h-40 w-full object-cover border border-border" />
            )}
          </div>

          {/* Two-column row */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={set('author')}
                className="w-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="Marta Kaine"
              />
            </div>
            <div>
              <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Publish Date</label>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                className="w-full border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Read Time</label>
              <input
                type="text"
                value={form.readTime}
                onChange={set('readTime')}
                className="w-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="5 min"
              />
            </div>
            <div>
              <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={set('tags')}
                className="w-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="Hardware, Analysis"
              />
            </div>
            <div>
              <label className="mono mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Batch</label>
              <input
                type="text"
                value={form.batch}
                onChange={set('batch')}
                className="w-full border border-border bg-card px-4 py-2.5 mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="2026-08-13"
              />
              <p className="mono mt-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                Publishing batch this article belongs to (e.g. today&rsquo;s date)
              </p>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="mono mb-2 block text-[11px] uppercase tracking-widest text-muted-foreground">Platforms</label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((p) => {
                const active = form.platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`display px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-colors border ${
                      active
                        ? 'border-transparent text-background'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                    style={active ? { background: p.accent } : {}}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mono mb-2 block text-[11px] uppercase tracking-widest text-muted-foreground">Status</label>
            <div className="flex gap-3">
              {['draft', 'published'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`display px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest border transition-colors ${
                    form.status === s
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mono text-[11px] uppercase tracking-widest text-destructive">{error}</p>
          )}

          <div className="flex gap-3 border-t border-border pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 display text-xs font-extrabold uppercase tracking-widest text-primary-foreground transition-opacity disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Article'}
            </button>
            <Link
              to="/admin"
              className="inline-flex items-center px-6 py-3 display text-xs font-extrabold uppercase tracking-widest border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ArticleEditor;
