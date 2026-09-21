"use client";

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDateShort, getStatusInfo } from '@/lib/utils';
import { CalendarCheck, Search, Filter, CheckCircle, XCircle, LogIn, LogOut, Eye } from 'lucide-react';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'belum_dikonfirm', label: 'Menunggu Konfirmasi' },
  { value: 'disetujui', label: 'Disetujui' },
  { value: 'aktif', label: 'Sedang Aktif' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

type Reservasi = {
  id: string; kodeBooking: string; tanggalReservasi: string;
  jamMulai: string; jamSelesai: string; durasiJam: number;
  totalBayar: number; status: string; createdAt: string;
  member: { namaMember: string; telp?: string };
  space: { namaSpace: string; tipe: string };
};

export default function AdminReservasiPage() {
  const now = new Date();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
  const [data, setData] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ month: filterMonth, year: filterYear });
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/admin/reservasi?${params}`);
    const json = await res.json();
    setData(json.data ?? []);
    setLoading(false);
  }, [filterStatus, filterMonth, filterYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const doAction = async (id: string, action: 'approve' | 'cancel' | 'checkin' | 'checkout') => {
    setActionLoading(id + action);
    let res;
    if (action === 'approve') res = await fetch(`/api/admin/reservasi/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'disetujui' }) });
    else if (action === 'cancel') res = await fetch(`/api/admin/reservasi/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'dibatalkan' }) });
    else if (action === 'checkin') res = await fetch(`/api/admin/reservasi/${id}/check-in`, { method: 'POST' });
    else res = await fetch(`/api/admin/reservasi/${id}/check-out`, { method: 'POST' });
    const json = await res!.json();
    setMsg(json.message);
    setActionLoading(null);
    fetchData();
    setTimeout(() => setMsg(''), 3000);
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2024, i).toLocaleString('id-ID', { month: 'long' }) }));
  const years = [2024, 2025, 2026].map(y => ({ value: String(y), label: String(y) }));

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <CalendarCheck size={30} style={{ color: 'var(--color-accent-primary)' }} /> Manajemen Reservasi
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Konfirmasi, check-in, dan check-out tamu Anda</p>
      </div>

      {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3) var(--spacing-4)', marginBottom: 'var(--spacing-4)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>{msg}</div>}

      {/* Filters */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--color-text-secondary)' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: 'var(--spacing-2) var(--spacing-3)', background: 'var(--color-bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
          {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{data.length} reservasi</span>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Kode', 'Member', 'Space', 'Tanggal & Jam', 'Total Bayar', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-secondary)' }}>Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-secondary)' }}>Tidak ada reservasi</td></tr>
              ) : data.map((r) => {
                const status = getStatusInfo(r.status);
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-primary)', whiteSpace: 'nowrap' }}>{r.kodeBooking}</td>
                    <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      <div>{r.member.namaMember}</div>
                      {r.member.telp && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{r.member.telp}</div>}
                    </td>
                    <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>{r.space.namaSpace}</td>
                    <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      <div>{formatDateShort(r.tanggalReservasi)}</div>
                      <div>{r.jamMulai} – {r.jamSelesai}</div>
                    </td>
                    <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatCurrency(Number(r.totalBayar))}</td>
                    <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                      <span style={{ padding: '3px var(--spacing-3)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 600, background: `${status.color.includes('yellow') ? '#f59e0b' : status.color.includes('blue') ? '#6366f1' : status.color.includes('green') ? '#10b981' : status.color.includes('red') ? '#ef4444' : '#a0a0b0'}20`, color: status.color.includes('yellow') ? '#f59e0b' : status.color.includes('blue') ? '#6366f1' : status.color.includes('green') ? '#10b981' : status.color.includes('red') ? '#ef4444' : '#a0a0b0', whiteSpace: 'nowrap' }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'nowrap' }}>
                        {r.status === 'belum_dikonfirm' && (
                          <>
                            <button onClick={() => doAction(r.id, 'approve')} disabled={actionLoading === r.id + 'approve'} title="Setujui" style={{ background: 'rgba(99,102,241,0.2)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2)', cursor: 'pointer', color: 'var(--color-accent-primary)' }}><CheckCircle size={16} /></button>
                            <button onClick={() => doAction(r.id, 'cancel')} disabled={actionLoading === r.id + 'cancel'} title="Tolak" style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2)', cursor: 'pointer', color: '#ef4444' }}><XCircle size={16} /></button>
                          </>
                        )}
                        {r.status === 'disetujui' && (
                          <button onClick={() => doAction(r.id, 'checkin')} disabled={actionLoading === r.id + 'checkin'} title="Check-In" style={{ background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2)', cursor: 'pointer', color: '#10b981' }}><LogIn size={16} /></button>
                        )}
                        {r.status === 'aktif' && (
                          <button onClick={() => doAction(r.id, 'checkout')} disabled={actionLoading === r.id + 'checkout'} title="Check-Out" style={{ background: 'rgba(245,158,11,0.1)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2)', cursor: 'pointer', color: '#f59e0b' }}><LogOut size={16} /></button>
                        )}
                        <Link href={`/api/reservasi/${r.id}/e-ticket`} target="_blank" title="E-Ticket" style={{ background: 'rgba(139,92,246,0.1)', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2)', cursor: 'pointer', color: 'var(--color-accent-secondary)', display: 'flex', alignItems: 'center' }}><Eye size={16} /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
