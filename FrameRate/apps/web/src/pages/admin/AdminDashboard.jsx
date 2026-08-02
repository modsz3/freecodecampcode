import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Plus, Edit2, Trash2, LogOut, Gamepad2, Eye, EyeOff } from 'lucide-react';
import { fetchAllArticles, deleteArticle, adminLogout } from '@/lib/articlesApi';
import { PLATFORMS } from '@/data/articles';

const statusBadge = (status) => (
  <span className={`mono inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest ${
    status === 'published'
      ? 'bg-accent/20 text-accent'
      : 'bg-muted text-muted-foreground'
  }`}>
    {status}
  </span>
);

const platformLabel = (pid) => PLATFORMS.find((p) => p.id === pid)?.label || pid;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllArticles();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin — EasyGamerNews</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Admin header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center bg-primary text-primary-foreground">
              <Gamepad2 className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="display text-xl font-black uppercase tracking-tighter">EasyGamerNews</span>
            <span className="mono hidden text-[11px] uppercase tracking-widest text-muted-foreground sm:block">/ Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/new"
              className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 display text-xs font-extrabold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-px"
            >
              <Plus className="h-3.5 w-3.5" /> New Article
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-border px-4 py-2.5 display text-xs font-extrabold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[90rem] px-5 py-10 lg:px-10">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <h1 className="display text-3xl font-black uppercase tracking-tight">Articles</h1>
          <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {articles.length} total
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="mono text-[11px] uppercase tracking-widest text-muted-foreground">Loading…</div>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border mt-8">
            <p className="text-muted-foreground">No articles yet.</p>
            <Link to="/admin/new" className="mono mt-4 inline-block text-[11px] uppercase tracking-widest text-primary">Create your first article</Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {articles.map((a) => (
              <div key={a.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {statusBadge(a.status)}
                    {(a.platforms || []).map((pid) => (
                      <span key={pid} className="mono text-[10px] uppercase tracking-widest text-muted-foreground">{platformLabel(pid)}</span>
                    ))}
                    <span className="mono text-[10px] text-muted-foreground">{a.date}</span>
                  </div>
                  <p className="display font-bold leading-snug truncate">{a.title}</p>
                  {a.dek && <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{a.dek}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {a.status === 'published' && (
                    <a
                      href={`/article/${a.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="h-3 w-3" /> View
                    </a>
                  )}
                  <Link
                    to={`/admin/edit/${a.id}`}
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(a.id, a.title)}
                    disabled={deleting === a.id}
                    className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 mono text-[10px] uppercase tracking-widest text-destructive hover:border-destructive transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
