import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, BarChart3 } from 'lucide-react';
import ReportsChart from '@/components/admin/ReportsChart';

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month ?? String(now.getMonth() + 1));
  const year = parseInt(params.year ?? String(now.getFullYear()));

  const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
  const endDate = new Date(year, month, 1);

  const reservasi = await prisma.reservasi.findMany({
    where: {
      tanggalReservasi: { gte: startDate, lt: endDate },
      status: { in: ['selesai', 'aktif'] },
    },
    include: { space: { select: { tipe: true, namaSpace: true } } },
    orderBy: { tanggalReservasi: 'asc' },
  });

  const totalPendapatan = reservasi.filter(r => r.status === 'selesai').reduce((a, r) => a + Number(r.totalBayar), 0);
  const totalReservasi = reservasi.length;
  const selesai = reservasi.filter(r => r.status === 'selesai').length;

  // Distribution by type
  const distribusi = reservasi.reduce((acc: Record<string, number>, r) => {
    if (r.status === 'selesai') acc[r.space.tipe] = (acc[r.space.tipe] ?? 0) + Number(r.totalBayar);
    return acc;
  }, {});

  const distribusiData = Object.entries(distribusi).map(([tipe, total]) => ({
    name: tipe === 'desk' ? 'Personal Desk' : tipe === 'meeting_room' ? 'Meeting Room' : 'Private Office',
    value: total,
  }));

  // Daily data for chart
  const dailyData: Record<string, number> = {};
  reservasi.filter(r => r.status === 'selesai').forEach(r => {
    const day = new Date(r.tanggalReservasi).getDate();
    const key = `${String(day).padStart(2, '0')}`;
    dailyData[key] = (dailyData[key] ?? 0) + Number(r.totalBayar);
  });

  const chartData = Object.entries(dailyData).map(([day, total]) => ({ day, total }));

  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2024, i).toLocaleString('id-ID', { month: 'long' }) }));
  const years = [2024, 2025, 2026];

  const statCards = [
    { label: 'Total Pendapatan', value: formatCurrency(totalPendapatan), color: '#10b981' },
    { label: 'Total Reservasi', value: totalReservasi, color: '#6366f1' },
    { label: 'Reservasi Selesai', value: selesai, color: '#8b5cf6' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <TrendingUp size={30} style={{ color: 'var(--color-accent-primary)' }} /> Laporan Pendapatan
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Rekapitulasi estimasi pendapatan per bulan</p>
      </div>

      {/* Month/Year Filter */}
      <form method="GET" style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)', flexWrap: 'wrap' }}>
        <select name="month" defaultValue={String(month)} style={{ padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select name="year" defaultValue={String(year)} style={{ padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button type="submit" className="btn btn-primary" style={{ padding: 'var(--spacing-2) var(--spacing-6)' }}>Tampilkan</button>
      </form>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="glass-panel" style={{ padding: 'var(--spacing-5)', borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-1)', color }}>{value}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <ReportsChart chartData={chartData} distribusiData={distribusiData} />
    </div>
  );
}
