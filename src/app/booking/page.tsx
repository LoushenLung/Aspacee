"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, calculateEndTime, getSpaceTypeLabel } from '@/lib/utils';
import { CalendarCheck, Clock, Tag, Loader2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

type Space = {
  id: string; namaSpace: string; hargaPerJam: number; tipe: string;
  kapasitas: number; deskripsi?: string; fasilitas?: string; foto?: string;
};

export default function BookingPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [filterTipe, setFilterTipe] = useState('');
  const [form, setForm] = useState({ tanggal: '', jamMulai: '09:00', durasiJam: '2', kodeDiskon: '' });
  const [availability, setAvailability] = useState<{ checked: boolean; isAvailable?: boolean }>({ checked: false });
  const [checking, setChecking] = useState(false);
  const [promoInfo, setPromoInfo] = useState<{ valid: boolean; diskon?: any; message?: string } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/spaces${filterTipe ? `?tipe=${filterTipe}` : ''}`)
      .then(r => r.json())
      .then(j => setSpaces(j.data ?? []));
  }, [filterTipe]);

  const checkAvailability = async () => {
    if (!selectedSpace || !form.tanggal || !form.jamMulai) return;
    setChecking(true);
    const params = new URLSearchParams({ spaceId: selectedSpace.id, tanggal: form.tanggal, jamMulai: form.jamMulai, durasiJam: form.durasiJam });
    const res = await fetch(`/api/spaces/availability?${params}`);
    const json = await res.json();
    setAvailability({ checked: true, isAvailable: json.data?.isAvailable });
    setChecking(false);
  };

  const checkPromo = async () => {
    if (!form.kodeDiskon) return;
    setCheckingPromo(true);
    const res = await fetch('/api/diskon/active');
    const json = await res.json();
    const found = (json.data ?? []).find((d: any) => d.kodeDiskon === form.kodeDiskon.toUpperCase());
    setPromoInfo(found ? { valid: true, diskon: found } : { valid: false, message: 'Kode promo tidak valid atau kadaluarsa' });
    setCheckingPromo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) { setError('Pilih space terlebih dahulu'); return; }
    if (!availability.isAvailable) { setError('Cek ketersediaan space terlebih dahulu'); return; }
    setSubmitting(true); setError('');
    const res = await fetch('/api/reservasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spaceId: selectedSpace.id, tanggalReservasi: form.tanggal, jamMulai: form.jamMulai, durasiJam: parseInt(form.durasiJam), kodeDiskon: form.kodeDiskon || undefined }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (json.status) router.push('/dashboard?booking=success');
    else setError(json.message);
  };

  const jamSelesai = form.jamMulai && form.durasiJam ? calculateEndTime(form.jamMulai, parseInt(form.durasiJam)) : '';
  const harga = selectedSpace ? Number(selectedSpace.hargaPerJam) * parseInt(form.durasiJam || '1') : 0;
  const diskonAmt = promoInfo?.valid ? harga * (Number(promoInfo.diskon.persentaseDiskon) / 100) : 0;
  const total = harga - diskonAmt;

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--spacing-3) var(--spacing-4)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: 'var(--spacing-8) 0' }}>
      <div className="container">
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)' }}>Booking Space</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Pilih ruangan, tentukan waktu, dan konfirmasi reservasi Anda</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--spacing-8)', alignItems: 'start' }}>
          {/* Step 1: Choose Space */}
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>1. Pilih Space</h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap' }}>
              {['', 'desk', 'meeting_room', 'private_office'].map(t => (
                <button key={t} onClick={() => setFilterTipe(t)} style={{ padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-full)', border: `1px solid ${filterTipe === t ? 'var(--color-accent-primary)' : 'var(--glass-border)'}`, background: filterTipe === t ? 'rgba(99,102,241,0.15)' : 'var(--color-bg-secondary)', color: filterTipe === t ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                  {t === '' ? 'Semua' : getSpaceTypeLabel(t)}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--spacing-3)' }}>
              {spaces.map(s => (
                <div key={s.id} onClick={() => { setSelectedSpace(s); setAvailability({ checked: false }); }}
                  style={{ borderRadius: 'var(--radius-xl)', border: `2px solid ${selectedSpace?.id === s.id ? 'var(--color-accent-primary)' : 'var(--glass-border)'}`, background: selectedSpace?.id === s.id ? 'rgba(99,102,241,0.1)' : 'var(--color-bg-secondary)', overflow: 'hidden', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
                >
                  <div style={{ height: '120px', background: 'var(--color-bg-tertiary)', position: 'relative' }}>
                    {s.foto ? <Image src={`/uploads/spaces/${s.foto}`} alt={s.namaSpace} fill style={{ objectFit: 'cover' }} unoptimized /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}><Users size={32} /></div>}
                  </div>
                  <div style={{ padding: 'var(--spacing-3)' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-1)' }}>{s.namaSpace}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{formatCurrency(Number(s.hargaPerJam))}/jam · {s.kapasitas} orang</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Form & Summary */}
          <div style={{ position: 'sticky', top: 'var(--spacing-8)' }}>
            <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-6)' }}>2. Detail Booking</h2>

              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)', color: '#ef4444', fontSize: 'var(--font-size-sm)', display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start' }}><AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {selectedSpace && (
                  <div style={{ padding: 'var(--spacing-3)', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-accent-primary)' }}>{selectedSpace.namaSpace}</div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>{getSpaceTypeLabel(selectedSpace.tipe)} · {formatCurrency(Number(selectedSpace.hargaPerJam))}/jam</div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Tanggal *</label>
                  <input type="date" style={inputStyle} value={form.tanggal} onChange={e => { setForm(f => ({ ...f, tanggal: e.target.value })); setAvailability({ checked: false }); }} required min={new Date().toISOString().split('T')[0]} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Jam Mulai</label>
                    <input type="time" style={inputStyle} value={form.jamMulai} onChange={e => { setForm(f => ({ ...f, jamMulai: e.target.value })); setAvailability({ checked: false }); }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Durasi (jam)</label>
                    <select style={inputStyle} value={form.durasiJam} onChange={e => { setForm(f => ({ ...f, durasiJam: e.target.value })); setAvailability({ checked: false }); }}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} jam</option>)}
                    </select>
                  </div>
                </div>

                {jamSelesai && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>⏰ Selesai pukul {jamSelesai}</div>}

                <button type="button" onClick={checkAvailability} disabled={!selectedSpace || !form.tanggal || checking} className="btn btn-secondary" style={{ gap: 'var(--spacing-2)' }}>
                  {checking ? <Loader2 size={16} /> : <Clock size={16} />}
                  {checking ? 'Mengecek...' : 'Cek Ketersediaan'}
                </button>

                {availability.checked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', background: availability.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: availability.isAvailable ? '#10b981' : '#ef4444', fontSize: 'var(--font-size-sm)' }}>
                    {availability.isAvailable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {availability.isAvailable ? 'Space tersedia!' : 'Space tidak tersedia pada waktu ini'}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>Kode Promo</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <input style={{ ...inputStyle, flex: 1, textTransform: 'uppercase', fontFamily: 'monospace' }} value={form.kodeDiskon} onChange={e => { setForm(f => ({ ...f, kodeDiskon: e.target.value.toUpperCase() })); setPromoInfo(null); }} placeholder="Kode promo (opsional)" />
                    <button type="button" onClick={checkPromo} disabled={!form.kodeDiskon || checkingPromo} style={{ padding: 'var(--spacing-2) var(--spacing-3)', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-accent-primary)', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {checkingPromo ? '...' : 'Terapkan'}
                    </button>
                  </div>
                  {promoInfo && (
                    <p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--font-size-xs)', color: promoInfo.valid ? '#10b981' : '#ef4444' }}>
                      {promoInfo.valid ? `✓ Diskon ${Number(promoInfo.diskon.persentaseDiskon)}% berhasil diterapkan!` : promoInfo.message}
                    </p>
                  )}
                </div>

                {/* Price Summary */}
                {selectedSpace && (
                  <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      <span>{formatCurrency(Number(selectedSpace.hargaPerJam))} × {form.durasiJam} jam</span>
                      <span>{formatCurrency(harga)}</span>
                    </div>
                    {diskonAmt > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: '#10b981' }}>
                        <span>Diskon {promoInfo?.diskon?.persentaseDiskon}%</span>
                        <span>-{formatCurrency(diskonAmt)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 'var(--spacing-2)', borderTop: '1px solid var(--glass-border)' }}>
                      <span>Total Bayar</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={submitting || !availability.isAvailable} style={{ gap: 'var(--spacing-2)', opacity: (!availability.isAvailable || submitting) ? 0.6 : 1 }}>
                  {submitting ? <Loader2 size={18} /> : <CalendarCheck size={18} />}
                  {submitting ? 'Memproses...' : 'Konfirmasi Reservasi'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
