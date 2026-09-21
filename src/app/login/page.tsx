"use client";

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Username atau password salah. Silakan coba lagi.');
      return;
    }

    const res = await fetch('/api/auth/session');
    const session = await res.json();
    const role = session?.user?.role;

    if (role === 'admin_space') {
      router.push('/admin');
    } else {
      router.push(redirect === '/admin' ? '/dashboard' : redirect);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--spacing-3) var(--spacing-4)',
    background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-base)', outline: 'none', transition: 'all var(--transition-fast)',
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
      {/* Back to Home */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-8)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-2)' }}>
          Selamat Datang Kembali
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Masuk untuk mengelola reservasi dan workspace Anda.
        </p>
      </div>

      {error && (
        <div className="animate-fade-in" style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)',
          marginBottom: 'var(--spacing-6)', color: '#ef4444', fontSize: 'var(--font-size-sm)',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>
            Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="Masukkan username Anda"
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-accent-primary)';
              e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--glass-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Masukkan password Anda"
            required
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-accent-primary)';
              e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--glass-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: 'var(--spacing-2)', gap: 'var(--spacing-2)', padding: 'var(--spacing-4)', opacity: loading ? 0.7 : 1 }}
        >
          {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Memproses...' : 'Masuk ke Akun'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-8)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        Belum punya akun?{' '}
        <Link href="/register" style={{ color: 'var(--color-accent-primary)', fontWeight: 'var(--font-weight-medium)' }}>
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr', // Default for mobile
      background: 'var(--color-bg-primary)',
    }} className="auth-layout">
      {/* Form Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-8)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Suspense fallback={<div style={{ color: 'var(--color-text-secondary)' }}>Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Visual Section (Hidden on Mobile, handled via CSS) */}
      <div className="auth-visual md-hidden" style={{
        background: 'var(--color-bg-secondary)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-12)',
        borderLeft: '1px solid var(--glass-border)'
      }}>
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--color-accent-primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--color-accent-tertiary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
        
        {/* Glassmorphism Feature Card */}
        <div className="glass-panel" style={{ position: 'relative', zIndex: 1, maxWidth: '400px', padding: 'var(--spacing-8)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-4)' }}>
            Ur<span className="text-gradient">Space</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            &ldquo;Temukan produktivitas maksimal di ruang kerja yang dirancang khusus untuk Anda. Fleksibel, modern, dan nyaman.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
