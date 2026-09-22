"use client";

import { useState, useEffect } from 'react';
import { Building2, User, Phone, MapPin, FileText, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    namaCoworking: '',
    namaPemilik: '',
    telp: '',
    alamat: '',
    deskripsi: '',
  });

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/admin/profile');
        const json = await res.json();
        if (json.success && json.data) {
          setForm({
            namaCoworking: json.data.namaCoworking || '',
            namaPemilik: json.data.namaPemilik || '',
            telp: json.data.telp || '',
            alamat: json.data.alamat || '',
            deskripsi: json.data.deskripsi || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Profil coworking space berhasil diperbarui!', 'success');
      } else {
        showToast(json.message || 'Gagal memperbarui profil', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--glass-border)', borderTopColor: 'var(--color-accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--color-bg-tertiary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: '0.4rem',
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: toast.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.875rem', fontWeight: 600, backdropFilter: 'blur(10px)',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Profil Coworking Space</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
          Kelola informasi profil coworking space yang akan ditampilkan kepada member dan pengunjung.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Form Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} style={{ color: 'var(--color-accent-primary)' }} /> Edit Data Profil
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>
                <Building2 size={14} /> Nama Coworking Space *
              </label>
              <input
                type="text"
                required
                value={form.namaCoworking}
                onChange={(e) => setForm({ ...form, namaCoworking: e.target.value })}
                placeholder="Contoh: Ur-Space Coworking"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <User size={14} /> Nama Pemilik / Penanggung Jawab *
              </label>
              <input
                type="text"
                required
                value={form.namaPemilik}
                onChange={(e) => setForm({ ...form, namaPemilik: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Phone size={14} /> Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={form.telp}
                onChange={(e) => setForm({ ...form, telp: e.target.value })}
                placeholder="Contoh: 08123456789"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <MapPin size={14} /> Alamat Lengkap
              </label>
              <input
                type="text"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                placeholder="Contoh: Jl. Teknologi No. 1, Malang, Jawa Timur"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <FileText size={14} /> Deskripsi Fasilitas & Layanan
              </label>
              <textarea
                rows={4}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Tuliskan deskripsi lengkap tentang ruang kerja dan fasilitas yang ditawarkan..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--gradient-accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                marginTop: '0.5rem',
              }}
            >
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* Live Preview Card */}
        <div>
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Preview Publik
            </h2>
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-primary)', fontWeight: 700 }}>
                  Coworking Space
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.25rem 0 0.5rem' }}>
                  {form.namaCoworking || 'Nama Coworking'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={13} /> Dikelola oleh <strong>{form.namaPemilik || 'Pemilik'}</strong>
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: 0 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-accent-primary)' }} />
                  <span>{form.alamat || 'Alamat belum diatur'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  <Phone size={15} style={{ flexShrink: 0, color: 'var(--color-accent-primary)' }} />
                  <span>{form.telp || 'Nomor kontak belum diatur'}</span>
                </div>
              </div>

              {form.deskripsi && (
                <div style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  fontSize: '0.825rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}>
                  {form.deskripsi}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
