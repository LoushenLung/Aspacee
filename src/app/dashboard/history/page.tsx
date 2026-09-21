"use client";

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDateShort, getStatusInfo } from '@/lib/utils';
import { CalendarCheck, QrCode, X, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type Reservasi = {
  id: string; kodeBooking: string; tanggalReservasi: string;
  jamMulai: string; jamSelesai: string; durasiJam: number;
  totalBayar: number; status: string;
  space: { namaSpace: string; tipe: string };
};

const STATUS_ALL = 'all';
const STATUS_OPTIONS = [
  { value: STATUS_ALL, label: 'Semua Status' },
  { value: 'belum_dikonfirm', label: 'Menunggu' },
  { value: 'disetujui', label: 'Disetujui' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

const STATUS_COLORS: Record<string, string> = {
  belum_dikonfirm: '#f59e0b',
  disetujui: '#6366f1',
  aktif: '#10b981',
  selesai: '#a0a0b0',
  dibatalkan: '#ef4444',
};

export default function MemberHistoryPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [data, setData] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [toast, setToast] = useState({ text: '', type: '' });

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reservasi?month=${month}&year=${year}`);
      const json = await res.json();
      setData(json.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/reservasi?month=${month}&year=${year}`);
        const json = await res.json();
        if (!ignore) {
          setData(json.data ?? []);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setData([]);
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [month, year]);

  const handleCancel = async (id: string, kode: string) => {
    if (!confirm(`Batalkan reservasi ${kode}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/reservasi/${id}/cancel`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        showToast('Reservasi berhasil dibatalkan.', 'success');
        fetchData();
      } else {
        showToast(json.message || 'Gagal membatalkan reservasi.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2024, i).toLocaleString('id-ID', { month: 'long' }),
  }));

  const filtered = statusFilter === STATUS_ALL ? data : data.filter((r) => r.status === statusFilter);

  const selectStyle: React.CSSProperties = {
    padding: '0.5rem 0.9rem', background: 'var(--color-bg-secondary)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)', fontSize: '0.875rem', cursor: 'pointer',
  };

  return (
    <div>
      {/* Toast */}
      {toast.text && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          fontSize: '0.875rem', fontWeight: 600, backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Histori Pemesanan</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>Riwayat semua reservasi Anda</p>
        </div>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', background: 'var(--gradient-accent)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          + Reservasi Baru
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={15} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={selectStyle}>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} style={selectStyle}>
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={() => fetchData()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          {filtered.length} reservasi ditemukan
        </span>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--glass-border)', borderTopColor: 'var(--color-accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <CalendarCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada reservasi ditemukan</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Coba ubah filter bulan atau status</p>
          </div>
        ) : filtered.map((r) => {
          const status = getStatusInfo(r.status);
          const statusColor = STATUS_COLORS[r.status] ?? '#a0a0b0';
          const canCancel = r.status === 'belum_dikonfirm';
          const hasTicket = ['disetujui', 'aktif', 'selesai'].includes(r.status);

          return (
            <div key={r.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', transition: 'transform 0.15s', borderLeft: `3px solid ${statusColor}` }}>
              {/* Left: info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.space.namaSpace}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                    {status.label}
                  </span>
                  {r.status === 'aktif' && (
                    <span style={{ fontSize: '0.7rem', color: '#10b981', animation: 'pulse 1.5s ease-in-out infinite' }}>● SEDANG AKTIF</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                  {formatDateShort(r.tanggalReservasi)} · {r.jamMulai} – {r.jamSelesai} ({r.durasiJam} jam)
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-accent-primary)' }}>
                  {r.kodeBooking}
                </div>
              </div>

              {/* Right: price + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(Number(r.totalBayar))}</div>
                </div>

                {hasTicket && (
                  <Link href={`/dashboard/reservasi/${r.id}/e-ticket`} title="Lihat E-Ticket" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.8rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-accent-primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                    <QrCode size={13} /> E-Ticket
                  </Link>
                )}

                {canCancel && (
                  <button
                    onClick={() => handleCancel(r.id, r.kodeBooking)}
                    disabled={cancelling === r.id}
                    title="Batalkan Reservasi"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.8rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: cancelling === r.id ? 0.6 : 1 }}
                  >
                    <X size={13} /> {cancelling === r.id ? 'Membatalkan...' : 'Batalkan'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
