"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Pencil, Trash2, X, Loader2, Eye } from 'lucide-react';

type Member = {
  id: string; namaMember: string; instansi?: string; telp?: string; alamat?: string; foto?: string; createdAt: string;
  user: { username: string; createdAt: string };
};

const emptyForm = { username: '', password: '', namaMember: '', instansi: '', telp: '', alamat: '' };

export default function AdminMembersPage() {
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/members');
    const json = await res.json();
    setData(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (json.status) { setMsg({ text: json.message, type: 'success' }); setShowModal(false); setForm(emptyForm); fetchData(); }
    else setMsg({ text: json.message, type: 'error' });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const filtered = data.filter(m =>
    m.namaMember.toLowerCase().includes(search.toLowerCase()) ||
    m.user.username.toLowerCase().includes(search.toLowerCase()) ||
    (m.instansi ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--spacing-3) var(--spacing-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)', outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Users size={30} style={{ color: 'var(--color-accent-primary)' }} /> Data Member
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Kelola akun dan data member coworking space</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="btn btn-primary" style={{ gap: 'var(--spacing-2)' }}><Plus size={18} /> Tambah Member</button>
      </div>

      {msg.text && <div style={{ background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)', marginBottom: 'var(--spacing-4)', color: msg.type === 'success' ? 'var(--color-success)' : '#ef4444', fontSize: 'var(--font-size-sm)' }}>{msg.text}</div>}

      {/* Search */}
      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <input style={{ ...inputStyle, maxWidth: '360px' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari berdasarkan nama, username, atau instansi..." />
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['No', 'Nama Member', 'Username', 'Instansi', 'Telepon', 'Terdaftar', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-secondary)' }}>Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-secondary)' }}>Tidak ada data member</td></tr>
              ) : filtered.map((m, idx) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{idx + 1}</td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{m.namaMember}</td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontFamily: 'monospace', color: 'var(--color-accent-primary)' }}>{m.user.username}</td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{m.instansi ?? '-'}</td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{m.telp ?? '-'}</td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{new Date(m.user.createdAt).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                    <button title="Lihat reservasi" style={{ padding: 'var(--spacing-2)', background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-accent-primary)' }}><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
              <h2 style={{ margin: 0 }}>Tambah Member Baru</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div><label style={labelStyle}>Username *</label><input style={inputStyle} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
                <div><label style={labelStyle}>Password *</label><input type="password" style={inputStyle} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></div>
              </div>
              <div><label style={labelStyle}>Nama Lengkap *</label><input style={inputStyle} value={form.namaMember} onChange={e => setForm(f => ({ ...f, namaMember: e.target.value }))} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div><label style={labelStyle}>Instansi</label><input style={inputStyle} value={form.instansi} onChange={e => setForm(f => ({ ...f, instansi: e.target.value }))} /></div>
                <div><label style={labelStyle}>No. Telepon</label><input style={inputStyle} value={form.telp} onChange={e => setForm(f => ({ ...f, telp: e.target.value }))} /></div>
              </div>
              <div><label style={labelStyle}>Alamat</label><textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} /></div>
              <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-2)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, gap: 'var(--spacing-2)' }}>
                  {saving && <Loader2 size={16} />} {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
