import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Gamepad2, Lock } from 'lucide-react';
import { adminLogin } from '@/lib/articlesApi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <Helmet>
        <title>Admin Login — EasyGamerNews</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center bg-primary text-primary-foreground">
            <Gamepad2 className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="display text-xl font-black uppercase tracking-tighter">EasyGamerNews</span>
        </div>
        <div className="border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h1 className="display text-lg font-black uppercase tracking-tight">Admin Login</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mono mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="admin@easygamernews.com"
              />
            </div>
            <div>
              <label className="mono mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="mono text-[11px] uppercase tracking-widest text-destructive">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground px-4 py-3 display text-xs font-extrabold uppercase tracking-widest text-background transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
