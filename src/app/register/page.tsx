"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, User, Building2, ArrowLeft } from 'lucide-react';

type RegisterType = 'member' | 'admin-space';

function RegisterForm() {
  const router = useRouter();
  const [regType, setRegType] = useState<RegisterType>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    namaMember: '', instansi: '', telp: '', alamat: '',
    namaCoworking: '', namaPemilik: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok'); return;
    }

    setLoading(true);

    const payload = regType === 'member'
      ? { username: form.username, password: form.password, namaMember: form.namaMember, instansi: form.instansi, telp: form.telp, alamat: form.alamat }
      : { username: form.username, password: form.password, namaCoworking: form.namaCoworking, namaPemilik: form.namaPemilik, telp: form.telp };

    const res = await fetch(`/api/auth/register/${regType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.status) { setError(data.message); return; }

    setSuccess('Registrasi berhasil! Mengarahkan ke halaman login...');
    setTimeout(() => router.push('/login'), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--spacing-3) var(--spacing-4)',
    background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-base)', outline: 'none', transition: 'all var(--transition-fast)',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-accent-primary)';
    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--glass-border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
      {/* Back to Home */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-8)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={16} /> Kembali ke Beranda
      </Link>

      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-2)' }}>
          Buat Akun Baru
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Pilih tipe akun dan lengkapi data Anda.
        </p>
      </div>

      {/* Type Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
        {(['member', 'admin-space'] as RegisterType[]).map((t) => (
          <button key={t} type="button" onClick={() => setRegType(t)}
            style={{
              padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: `1px solid ${regType === t ? 'var(--color-accent-primary)' : 'var(--glass-border)'}`,
              background: regType === t ? 'rgba(99,102,241,0.15)' : 'var(--color-bg-tertiary)',
              color: regType === t ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {t === 'member' ? <User size={16} /> : <Building2 size={16} />}
            {t === 'member' ? 'Member' : 'Admin Space'}
          </button>
        ))}
      </div>

      {error && <div className="animate-fade-in" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)', marginBottom: 'var(--spacing-4)', color: '#ef4444', fontSize: 'var(--font-size-sm)' }}>{error}</div>}
      {success && <div className="animate-fade-in" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)', marginBottom: 'var(--spacing-4)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' }}>Username *</label>
            <input type="text" style={inputStyle} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required placeholder="username" onFocus={handleFocus} onBlur={handleBlur} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' }}>No. Telepon</label>
            <input type="text" style={inputStyle} value={form.telp} onChange={e => setForm(f => ({ ...f, telp: e.target.value }))} placeholder="08xxxxxxxxxx" onFocus={handleFocus} onBlur={handleBlur} />
          </div>
        </div>

        {regType === 'member' ? (
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' }}>Nama Lengkap *</label>
            <input type="text" style={inputStyle} value={form.namaMember} onChange={e => setForm(f => ({ ...f, namaMember: e.target.value }))} required placeholder="Nama lengkap Anda" onFocus={handleFocus} onBlur={handleBlur} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' }}>Nama Coworking *</label>
              <input type="text" style={inputStyle} value={form.namaCoworking} onChange={e => setForm(f => ({ ...f, namaCoworking: e.target.value }))} required placeholder="Nama space" onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' }}>Nama Pemilik *</label>
              <input type="text" style={inputStyle} value={form.namaPemilik} onChange={e => setForm(f => ({ ...f, namaPemilik: e.target.value }))} required placeholder="Nama Anda" onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' }}>Password *</label>
            <input type="password" style={inputStyle} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min. 6 karakter" onFocus={handleFocus} onBlur={handleBlur} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' }}>Konfirmasi Password *</label>
            <input type="password" style={inputStyle} value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required placeholder="Ulangi password" onFocus={handleFocus} onBlur={handleBlur} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)', padding: 'var(--spacing-4)', opacity: loading ? 0.7 : 1 }}>
          {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Memproses...' : 'Daftar Sekarang'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-8)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        Sudah punya akun?{' '}
        <Link href="/login" style={{ color: 'var(--color-accent-primary)', fontWeight: 'var(--font-weight-medium)' }}>Masuk di sini</Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
        <RegisterForm />
      </div>

      {/* Visual Section (Hidden on Mobile) */}
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
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'var(--color-accent-secondary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '500px', height: '500px', background: 'var(--color-accent-primary)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }} />
        
        <div className="glass-panel" style={{ position: 'relative', zIndex: 1, maxWidth: '400px', padding: 'var(--spacing-8)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-4)' }}>
            Join Ur<span className="text-gradient">Space</span>
          </div>
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            &ldquo;Mulai perjalanan produktif Anda hari ini. Kelola semua kebutuhan ruang kerja Anda dalam satu platform cerdas.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
