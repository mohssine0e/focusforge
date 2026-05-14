import React, { useState } from 'react';
import { authApi } from '../api/authApi';
import type { AuthResponse } from '../types';

interface AuthPageProps {
  onAuthenticated: (auth: AuthResponse) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('John Developer');
  const [email, setEmail] = useState('demo@focusforge.dev');
  const [password, setPassword] = useState('focusforge');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const auth = mode === 'login'
        ? await authApi.login({ email, password })
        : await authApi.register({ name, email, password });
      onAuthenticated(auth);
    } catch (err) {
      setError('Authentication failed. Check your email and password.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const loadDemo = () => {
    setMode('login');
    setEmail('demo@focusforge.dev');
    setPassword('focusforge');
    setName('John Developer');
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_30%),linear-gradient(135deg,#050d16_0%,#07111d_55%,#0b1422_100%)] px-4 py-8 text-[#f0f0f5]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#223047] bg-[#07111d]/80 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6]/20 text-sm font-bold text-[#a78bfa]">F</span>
            <span className="text-xl font-semibold text-white"><span className="text-[#a78bfa]">Focus</span>Forge</span>
          </div>
          <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight text-white lg:text-6xl">
            Engineering work, deadlines, and focus in one private workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#a8b0c0]">
            Sign in to your personal command center for projects, studies, blocked tasks, focus sessions, and progress analytics.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {['Project health', 'Deadline radar', 'Focus history'].map((label) => (
              <div key={label} className="rounded-xl border border-[#223047] bg-[#121a29]/80 p-4">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-2 text-xs text-[#8a94a6]">Live data after login</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#223047] bg-[#121a29] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
          <div className="flex rounded-xl border border-[#223047] bg-[#07111d] p-1">
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-[#8b5cf6] text-white' : 'text-[#8a94a6]'}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-[#8b5cf6] text-white' : 'text-[#8a94a6]'}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === 'register' && (
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">Name</span>
                <input
                  className="w-full rounded-lg border border-[#223047] bg-[#07111d] px-3 py-3 text-sm text-white outline-none focus:border-[#8b5cf6]"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">Email</span>
              <input
                className="w-full rounded-lg border border-[#223047] bg-[#07111d] px-3 py-3 text-sm text-white outline-none focus:border-[#8b5cf6]"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8a94a6]">Password</span>
              <input
                className="w-full rounded-lg border border-[#223047] bg-[#07111d] px-3 py-3 text-sm text-white outline-none focus:border-[#8b5cf6]"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>}

            <button
              className="w-full rounded-lg bg-[#8b5cf6] px-4 py-3 text-sm font-semibold text-white hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || !email.trim() || !password.trim() || (mode === 'register' && !name.trim())}
              type="submit"
            >
              {submitting ? 'Signing in...' : mode === 'login' ? 'Enter workspace' : 'Create account'}
            </button>
          </form>

          <button
            className="mt-4 w-full rounded-lg border border-[#223047] px-4 py-3 text-sm font-semibold text-[#c5cbd8] hover:bg-[#172238]"
            onClick={loadDemo}
            type="button"
          >
            Use demo account
          </button>
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
