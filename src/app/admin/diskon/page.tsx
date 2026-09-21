"use client";

import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';

type Diskon = {
  id: string; namaDiskon: string; kodeDiskon: string;
  persentaseDiskon: number; tanggalAwal: string; tanggalAkhir: string;
};

const emptyForm = { namaDiskon: '', kodeDiskon: '', persentaseDiskon: '10', tanggalAwal: '', tanggalAkhir: '' };

export default function AdminDiskonPage() {
  const [data, setData] = useState<Diskon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Diskon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/diskon');
    const json = await res.json();
    setData(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (d: Diskon) => {
    setEditing(d);
    setForm({
      namaDiskon: d.namaDiskon, kodeDiskon: d.kodeDiskon,
      persentaseDiskon: String(d.persentaseDiskon),
      tanggalAwal: d.tanggalAwal.split('T')[0],
      tanggalAkhir: d.tanggalAkhir.split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, persentaseDiskon: Number(form.persentaseDiskon) };
    const res = await fetch(editing ? `/api/admin/diskon/${editing.id}` : '/api/admin/diskon', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);
    if (json.status) { setMsg({ text: json.message, type: 'success' }); setShowModal(false); fetchData(); }
    else setMsg({ text: json.message, type: 'error' });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus diskon ini?')) return;
    await fetch(`/api/admin/diskon/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const now = new Date();
  const isActive = (d: Diskon) => new Date(d.tanggalAwal) <= now && now <= new Date(d.tanggalAkhir);
  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--spacing-3) var(--spacing-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)', outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)', color: 'var(--color-text-primary)' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <Tag size={30} style={{ color: 'var(--color-accent-primary)' }} /> Promo & Diskon
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Kelola kode promo dan event diskon</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary" style={{ gap: 'var(--spacing-2)' }}><Plus size={18} /> Tambah Promo</button>
      </div>

      {msg.text && <div style={{ background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)', marginBottom: 'var(--spacing-4)', color: msg.type === 'success' ? 'var(--color-success)' : '#ef4444', fontSize: 'var(--font-size-sm)' }}>{msg.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-4)' }}>
        {loading ? <p style={{ color: 'var(--color-text-secondary)' }}>Memuat...</p> : data.map(d => {
          const active = isActive(d);
          return (
            <div key={d.id} className="glass-panel" style={{ padding: 'var(--spacing-5)', borderLeft: `4px solid ${active ? 'var(--color-accent-primary)' : 'var(--glass-border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-3)' }}>
                <div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }} className="text-gradient">{Number(d.persentaseDiskon)}% OFF</div>
                  <div style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>{d.namaDiskon}</div>
                </div>
                <span style={{ padding: '3px var(--spacing-3)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 600, background: active ? 'rgba(16,185,129,0.1)' : 'rgba(160,160,176,0.1)', color: active ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                  {active ? '● Aktif' : '○ Tidak Aktif'}
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', background: 'var(--color-bg-tertiary)', padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-accent-primary)', letterSpacing: '0.1em', marginBottom: 'var(--spacing-3)', display: 'inline-block' }}>
                {d.kodeDiskon}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                {new Date(d.tanggalAwal).toLocaleDateString('id-ID')} – {new Date(d.tanggalAkhir).toLocaleDateString('id-ID')}
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <button onClick={() => openEdit(d)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}><Pencil size={14} /> Edit</button>
                <button onClick={() => handleDelete(d.id)} style={{ padding: 'var(--spacing-2) var(--spacing-3)', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
              <h2 style={{ margin: 0 }}>{editing ? 'Edit Promo' : 'Tambah Promo Baru'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div><label style={labelStyle}>Nama Promo *</label><input style={inputStyle} value={form.namaDiskon} onChange={e => setForm(f => ({ ...f, namaDiskon: e.target.value }))} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-4)' }}>
                <div><label style={labelStyle}>Kode Diskon *</label><input style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'monospace' }} value={form.kodeDiskon} onChange={e => setForm(f => ({ ...f, kodeDiskon: e.target.value.toUpperCase() }))} required /></div>
                <div><label style={labelStyle}>Diskon (%)</label><input type="number" style={inputStyle} value={form.persentaseDiskon} onChange={e => setForm(f => ({ ...f, persentaseDiskon: e.target.value }))} required min="1" max="100" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div><label style={labelStyle}>Tanggal Mulai *</label><input type="date" style={inputStyle} value={form.tanggalAwal} onChange={e => setForm(f => ({ ...f, tanggalAwal: e.target.value }))} required /></div>
                <div><label style={labelStyle}>Tanggal Berakhir *</label><input type="date" style={inputStyle} value={form.tanggalAkhir} onChange={e => setForm(f => ({ ...f, tanggalAkhir: e.target.value }))} required /></div>
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
