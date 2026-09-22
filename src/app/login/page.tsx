"use client";

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '';
  const errorParam = searchParams.get('error');
  const registeredParam = searchParams.get('registered');
  const alertParam = searchParams.get('alert');

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(() => {
    if (errorParam === 'CredentialsSignin') return 'Username/Email atau password yang Anda masukkan salah.';
    if (errorParam === 'SessionRequired') return 'Sesi Anda telah berakhir. Silakan login kembali.';
    if (errorParam === 'AccessDenied') return 'Akses ditolak. Anda tidak memiliki izin untuk halaman tersebut.';
    if (alertParam) return alertParam;
    return '';
  });
  const [success, setSuccess] = useState(() => {
    if (registeredParam === '1') return 'Registrasi berhasil! Silakan masuk dengan akun baru Anda.';
    return '';
  });
  const [loading, setLoading] = useState(false);

  const performLogin = async (usernameInput: string, passwordInput: string) => {
    const cleanUsername = usernameInput.trim();
    if (!cleanUsername || !passwordInput) {
      setError('Mohon masukkan username/email dan password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn('credentials', {
        username: cleanUsername,
        password: passwordInput,
        redirect: false,
      });

      if (!result || result.error) {
        setLoading(false);
        setError('Username/Email atau password salah. Silakan periksa kembali data login Anda.');
        return;
      }

      setSuccess('Login berhasil! Mengalihkan ke halaman dashboard...');

      // Retrieve user role from session
      let role = '';
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const res = await fetch('/api/auth/session', { cache: 'no-store' });
          if (res.ok) {
            const session = await res.json();
            if (session?.user?.role) {
              role = session.user.role;
              break;
            }
          }
        } catch {
          // ignore error and retry
        }
        await new Promise((r) => setTimeout(r, 150));
      }

      // Fallback heuristics if session endpoint is delayed
      if (!role) {
        if (cleanUsername.toLowerCase().includes('admin')) {
          role = 'admin_space';
        } else {
          role = 'member';
        }
      }

      let targetUrl = '/dashboard';
      if (role === 'admin_space') {
        targetUrl = '/admin';
      } else if (redirect && redirect !== '/admin' && redirect !== '/login') {
        targetUrl = redirect;
      }

      // Hard redirect ensures cookies are fully flushed to server requests
      window.location.href = targetUrl;
    } catch {
      setLoading(false);
      setError('Terjadi kendala jaringan saat proses autentikasi. Silakan coba kembali.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(form.username, form.password);
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setForm({ username: u, password: p });
    await performLogin(u, p);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--spacing-3) var(--spacing-4)',
    background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-base)', outline: 'none', transition: 'all var(--transition-fast)',
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
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

      {/* Error Alert */}
      {error && (
        <div className="animate-fade-in" style={{
          background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)',
          marginBottom: 'var(--spacing-6)', color: '#f87171', fontSize: 'var(--font-size-sm)',
          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
        }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚠️</span>
          <div style={{ flex: 1 }}>{error}</div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="animate-fade-in" style={{
          background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)',
          marginBottom: 'var(--spacing-6)', color: '#34d399', fontSize: 'var(--font-size-sm)',
          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
        }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>✓</span>
          <div style={{ flex: 1 }}>{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>
            Username atau Email
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="Masukkan username atau email Anda"
            required
            disabled={loading}
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
            disabled={loading}
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
          {loading ? 'Memverifikasi kredensial...' : 'Masuk ke Akun'}
        </button>
      </form>

      {/* Quick Demo Accounts Selection */}
      <div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)' }}>
        <div style={{ fontSize: '12px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🧪 Akun Uji Coba Cepat (Demo):</span>
          <span style={{ fontSize: '11px', color: 'var(--color-accent-primary)' }}>Klik untuk login instan</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 12px',
              borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)',
              color: 'var(--color-text-primary)', fontSize: '12px',
            }}
          >
            <div>
              👑 <strong>Admin Dummy:</strong> <code style={{ color: 'var(--color-accent-primary)' }}>admin_dummy</code>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>dummy.admin@urspace.id · pass: admin123</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setForm({ username: 'admin_dummy', password: 'admin123' })}
                disabled={loading}
                style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--color-text-secondary)', fontSize: '11px', cursor: 'pointer' }}
              >
                Isi Form
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin_dummy', 'admin123')}
                disabled={loading}
                style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--color-accent-primary)', border: 'none', color: 'white', fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}
              >
                Login Admin ➔
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 12px',
              borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)',
              color: 'var(--color-text-primary)', fontSize: '12px',
            }}
          >
            <div>
              🏢 <strong>Admin Utama:</strong> <code style={{ color: 'var(--color-accent-primary)' }}>admin</code>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>admin@urspace.id · pass: admin123</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setForm({ username: 'admin', password: 'admin123' })}
                disabled={loading}
                style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--color-text-secondary)', fontSize: '11px', cursor: 'pointer' }}
              >
                Isi Form
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                disabled={loading}
                style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--color-accent-primary)', border: 'none', color: 'white', fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}
              >
                Login Admin ➔
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 12px',
              borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)',
              color: 'var(--color-text-primary)', fontSize: '12px',
            }}
          >
            <div>
              👤 <strong>Member Demo:</strong> <code style={{ color: 'var(--color-accent-primary)' }}>member1</code>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>member1@urspace.id · pass: member123</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setForm({ username: 'member1', password: 'member123' })}
                disabled={loading}
                style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--color-text-secondary)', fontSize: '11px', cursor: 'pointer' }}
              >
                Isi Form
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('member1', 'member123')}
                disabled={loading}
                style={{ padding: '4px 8px', borderRadius: '4px', background: '#10b981', border: 'none', color: 'white', fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}
              >
                Login Member ➔
              </button>
            </div>
          </div>
        </div>
      </div>

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
