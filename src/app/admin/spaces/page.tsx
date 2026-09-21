"use client";

import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { formatCurrency, getSpaceTypeLabel } from '@/lib/utils';
import Image from 'next/image';

type Space = {
  id: string; namaSpace: string; hargaPerJam: number; tipe: string;
  kapasitas: number; deskripsi?: string; fasilitas?: string; foto?: string; isActive: boolean;
};

const TIPE_OPTIONS = [
  { value: 'desk', label: 'Personal Desk' },
  { value: 'meeting_room', label: 'Meeting Room' },
  { value: 'private_office', label: 'Private Office' },
];

const emptyForm = { namaSpace: '', hargaPerJam: '', tipe: 'desk', kapasitas: '1', deskripsi: '', fasilitas: '', foto: '' };

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Space | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/spaces');
    const json = await res.json();
    setSpaces(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: Space) => {
    setEditing(s);
    setForm({
      namaSpace: s.namaSpace, hargaPerJam: String(s.hargaPerJam), tipe: s.tipe,
      kapasitas: String(s.kapasitas), deskripsi: s.deskripsi ?? '',
      fasilitas: s.fasilitas ? JSON.parse(s.fasilitas).join(', ') : '', foto: s.foto ?? '',
    });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload/spaces', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.status) setForm(f => ({ ...f, foto: json.data.filename }));
    setUploadLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      hargaPerJam: Number(form.hargaPerJam),
      kapasitas: Number(form.kapasitas),
      fasilitas: form.fasilitas ? form.fasilitas.split(',').map(f => f.trim()).filter(Boolean) : [],
    };
    const res = await fetch(editing ? `/api/admin/spaces/${editing.id}` : '/api/admin/spaces', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);
    if (json.status) { setMsg({ text: json.message, type: 'success' }); setShowModal(false); fetchSpaces(); }
    else setMsg({ text: json.message, type: 'error' });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus space ini? (akan dinonaktifkan)')) return;
    await fetch(`/api/admin/spaces/${id}`, { method: 'DELETE' });
    fetchSpaces();
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--spacing-3) var(--spacing-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)', outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Building2 size={30} style={{ color: 'var(--color-accent-primary)' }} /> Kelola Space
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Tambah, edit, dan hapus ruangan/meja coworking</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" style={{ gap: 'var(--spacing-2)' }}><Plus size={18} /> Tambah Space</button>
      </div>

      {msg.text && <div style={{ background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)', marginBottom: 'var(--spacing-4)', color: msg.type === 'success' ? 'var(--color-success)' : '#ef4444', fontSize: 'var(--font-size-sm)' }}>{msg.text}</div>}

      {/* Grid */}
      {loading ? <p style={{ color: 'var(--color-text-secondary)' }}>Memuat...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-4)' }}>
          {spaces.map(s => (
            <div key={s.id} className="glass-panel" style={{ overflow: 'hidden' }}>
              <div style={{ height: '160px', background: 'var(--color-bg-tertiary)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.foto ? <Image src={`/uploads/spaces/${s.foto}`} alt={s.namaSpace} fill style={{ objectFit: 'cover' }} unoptimized /> : <Building2 size={40} style={{ opacity: 0.3 }} />}
                {!s.isActive && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-sm)', color: '#ef4444', fontWeight: 600 }}>NONAKTIF</div>}
              </div>
              <div style={{ padding: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{s.namaSpace}</h3>
                  <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px var(--spacing-2)', borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent-primary)' }}>{getSpaceTypeLabel(s.tipe)}</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                  {formatCurrency(Number(s.hargaPerJam))}/jam · Kapasitas {s.kapasitas}
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  <button onClick={() => openEdit(s)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}><Pencil size={14} /> Edit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ padding: 'var(--spacing-2) var(--spacing-3)', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
              <h2 style={{ margin: 0 }}>{editing ? 'Edit Space' : 'Tambah Space Baru'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div><label style={labelStyle}>Nama Space *</label><input style={inputStyle} value={form.namaSpace} onChange={e => setForm(f => ({ ...f, namaSpace: e.target.value }))} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div><label style={labelStyle}>Harga/Jam (Rp) *</label><input type="number" style={inputStyle} value={form.hargaPerJam} onChange={e => setForm(f => ({ ...f, hargaPerJam: e.target.value }))} required min="0" /></div>
                <div><label style={labelStyle}>Kapasitas *</label><input type="number" style={inputStyle} value={form.kapasitas} onChange={e => setForm(f => ({ ...f, kapasitas: e.target.value }))} required min="1" /></div>
              </div>
              <div><label style={labelStyle}>Tipe Space *</label>
                <select style={inputStyle} value={form.tipe} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}>
                  {TIPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Deskripsi</label><textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} /></div>
              <div><label style={labelStyle}>Fasilitas (pisahkan dengan koma)</label><input style={inputStyle} value={form.fasilitas} onChange={e => setForm(f => ({ ...f, fasilitas: e.target.value }))} placeholder="WiFi, AC, Proyektor, Whiteboard" /></div>
              <div>
                <label style={labelStyle}>Foto Space</label>
                <input type="file" accept="image/*" onChange={handleUpload} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }} />
                {uploadLoading && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>Mengupload...</p>}
                {form.foto && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginTop: 'var(--spacing-2)' }}>✓ {form.foto}</p>}
              </div>
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
