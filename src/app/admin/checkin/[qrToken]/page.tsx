'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, User, MapPin, Calendar, AlertTriangle } from 'lucide-react';

interface CheckinData {
  id: string;
  kodeBooking: string;
  status: string;
  tanggalReservasi: string;
  jamMulai: string;
  jamSelesai: string;
  durasiJam: number;
  totalBayar: number;
  catatan?: string;
  member: { namaMember: string; instansi?: string; foto?: string };
  space: { namaSpace: string; tipe: string; owner: { namaCoworking: string } };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const MAKER_KEY = process.env.NEXT_PUBLIC_MAKER_KEY || 'default-maker';

type PageState = 'loading' | 'ready' | 'checking-in' | 'success' | 'error' | 'already-done';

export default function CheckinPage() {
  const params = useParams();
  const qrToken = params.qrToken as string;

  const [reservasi, setReservasi] = useState<CheckinData | null>(null);
  const [state, setState] = useState<PageState>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchByToken = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = { 'x-maker-key': MAKER_KEY };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/admin/checkin/${qrToken}`, {
          headers,
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Reservasi tidak ditemukan');

        setReservasi(json.data);

        if (json.data.status === 'aktif') { setState('already-done'); return; }
        if (json.data.status === 'selesai' || json.data.status === 'dibatalkan') {
          setState('error');
          setErrorMsg(`Reservasi ini sudah berstatus "${json.data.status}", tidak bisa check-in.`);
          return;
        }
        if (json.data.status !== 'disetujui') {
          setState('error');
          setErrorMsg(`Reservasi harus berstatus "Disetujui" sebelum bisa check-in. Status saat ini: ${json.data.status}`);
          return;
        }

        setState('ready');
      } catch (err: any) {
        setState('error');
        setErrorMsg(err.message);
      }
    };
    fetchByToken();
  }, [qrToken]);

  const handleCheckIn = async () => {
    if (!reservasi) return;
    setState('checking-in');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {
        'x-maker-key': MAKER_KEY,
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/admin/reservasi/${reservasi.id}/check-in`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal melakukan check-in');
      setState('success');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // ── LOADING ──
  if (state === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
      <div style={{ width: 60, height: 60, border: '4px solid var(--glass-border)', borderTopColor: 'var(--color-accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Memverifikasi QR Code...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── ERROR ──
  if (state === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <XCircle size={40} color="#f87171" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Check-in Gagal</h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400 }}>{errorMsg}</p>
    </div>
  );

  // ── ALREADY DONE ──
  if (state === 'already-done') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={40} color="#4ade80" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Sudah Check-in</h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400 }}>
        Tamu <strong>{reservasi?.member.namaMember}</strong> sudah melakukan check-in sebelumnya untuk reservasi <strong>{reservasi?.kodeBooking}</strong>.
      </p>
    </div>
  );

  // ── SUCCESS ──
  if (state === 'success') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pop 0.4s ease-out' }}>
        <CheckCircle size={56} color="#4ade80" />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Check-in Berhasil!
      </h1>
      <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: 360, width: '100%', textAlign: 'left' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>TAMU</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{reservasi?.member.namaMember}</div>
          {reservasi?.member.instansi && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{reservasi.member.instansi}</div>}
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>RUANGAN</div>
          <div style={{ fontWeight: 700 }}>{reservasi?.space.namaSpace}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>WAKTU</div>
          <div style={{ fontWeight: 700 }}>{reservasi?.jamMulai} – {reservasi?.jamSelesai}</div>
        </div>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Silakan persilakan tamu menuju ruangan yang telah dipesan.</p>
      <style>{`@keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );

  // ── READY ──
  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '999px', background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', marginBottom: '1rem' }}>
            <AlertTriangle size={14} color="#fbbf24" />
            <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>Konfirmasi Check-in</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Verifikasi Tamu</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Pastikan data di bawah sudah sesuai sebelum melanjutkan</p>
        </div>

        {/* Guest Card */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          {/* Member */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {reservasi?.member.namaMember.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{reservasi?.member.namaMember}</div>
              {reservasi?.member.instansi && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{reservasi.member.instansi}</div>}
              <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-accent-primary)', marginTop: '0.2rem' }}>{reservasi?.kodeBooking}</div>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                <MapPin size={12} /> RUANGAN
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{reservasi?.space.namaSpace}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{reservasi?.space.owner.namaCoworking}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                <Calendar size={12} /> TANGGAL
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{reservasi && formatDate(reservasi.tanggalReservasi)}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                <Clock size={12} /> WAKTU
              </div>
              <div style={{ fontWeight: 700 }}>{reservasi?.jamMulai} – {reservasi?.jamSelesai}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{reservasi?.durasiJam} jam</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                💳 TOTAL BAYAR
              </div>
              <div style={{ fontWeight: 700, background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {reservasi && formatCurrency(reservasi.totalBayar)}
              </div>
            </div>
          </div>

          {reservasi?.catatan && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>📝 CATATAN TAMU</div>
              <div style={{ fontSize: '0.88rem' }}>{reservasi.catatan}</div>
            </div>
          )}
        </div>

        {/* Check-in Button */}
        <button
          onClick={handleCheckIn}
          disabled={state === 'checking-in'}
          style={{
            width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-accent)', color: 'white',
            border: 'none', cursor: state === 'checking-in' ? 'not-allowed' : 'pointer',
            fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.02em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            opacity: state === 'checking-in' ? 0.7 : 1,
            transition: 'opacity 0.2s, transform 0.1s',
            boxShadow: '0 8px 25px rgba(139,92,246,0.4)',
          }}
        >
          {state === 'checking-in' ? (
            <>
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Memproses...
            </>
          ) : (
            <>
              <CheckCircle size={22} />
              Konfirmasi Check-in
            </>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
