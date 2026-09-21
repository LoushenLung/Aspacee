'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, BarChart2, DollarSign, Clock, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  summary: { totalIncome: number; totalBookings: number; avgPerBooking: number; totalHours: number };
  byType: Record<string, { count: number; income: number; hours: number }>;
  monthlyTrend: { month: string; income: number; count: number }[];
  topSpaces: { nama: string; count: number; income: number }[];
}

const TYPE_LABELS: Record<string, string> = {
  desk: 'Personal Desk',
  meeting_room: 'Meeting Room',
  private_office: 'Private Office',
};

const TYPE_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4'];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, notation: 'compact', compactDisplay: 'short' }).format(n);
}
function formatCurrencyFull(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function LaporanPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const lineChart = useRef<any>(null);
  const donutChart = useRef<any>(null);

  useEffect(() => {
    fetch('/api/admin/reports/full')
      .then((r) => r.json())
      .then((json) => { setData(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Draw charts after data loads
  useEffect(() => {
    if (!data) return;

    const loadCharts = async () => {
      // Dynamically import Chart.js to keep bundle light
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      // ── LINE CHART: Monthly Revenue Trend ──
      if (lineRef.current) {
        if (lineChart.current) lineChart.current.destroy();
        const ctx = lineRef.current.getContext('2d');
        if (ctx) {
          lineChart.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: data.monthlyTrend.map((m) => m.month),
              datasets: [
                {
                  label: 'Pendapatan',
                  data: data.monthlyTrend.map((m) => m.income),
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139,92,246,0.12)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#8b5cf6',
                  pointRadius: 4,
                  pointHoverRadius: 7,
                },
                {
                  label: 'Jumlah Booking',
                  data: data.monthlyTrend.map((m) => m.count),
                  borderColor: '#06b6d4',
                  backgroundColor: 'rgba(6,182,212,0.08)',
                  fill: true,
                  tension: 0.4,
                  yAxisID: 'y2',
                  pointBackgroundColor: '#06b6d4',
                  pointRadius: 4,
                  pointHoverRadius: 7,
                },
              ],
            },
            options: {
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
                tooltip: {
                  callbacks: {
                    label: (ctx) => ctx.datasetIndex === 0 ? ` ${formatCurrencyFull(ctx.parsed.y ?? 0)}` : ` ${ctx.parsed.y ?? 0} booking`,
                  },
                },
              },
              scales: {
                x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: {
                  ticks: { color: '#64748b', callback: (v) => formatCurrency(Number(v)) },
                  grid: { color: 'rgba(255,255,255,0.06)' },
                },
                y2: {
                  position: 'right',
                  ticks: { color: '#06b6d4', font: { size: 11 } },
                  grid: { display: false },
                },
              },
            },
          });
        }
      }

      // ── DONUT CHART: Revenue by Space Type ──
      if (donutRef.current) {
        if (donutChart.current) donutChart.current.destroy();
        const ctx = donutRef.current.getContext('2d');
        if (ctx) {
          const types = Object.keys(data.byType);
          const isEmpty = types.length === 0;
          donutChart.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: isEmpty ? ['Tidak ada data'] : types.map((t) => TYPE_LABELS[t] ?? t),
              datasets: [{
                data: isEmpty ? [1] : types.map((t) => data.byType[t].income),
                backgroundColor: isEmpty ? ['rgba(100,116,139,0.3)'] : TYPE_COLORS.slice(0, types.length),
                borderWidth: 2,
                borderColor: 'rgba(15,23,42,0.8)',
              }],
            },
            options: {
              responsive: true,
              cutout: '65%',
              plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 12 } } },
                tooltip: {
                  callbacks: {
                    label: (ctx) => isEmpty ? ' Belum ada data' : ` ${formatCurrencyFull(ctx.parsed)}`,
                  },
                },
              },
            },
          });
        }
      }
    };

    loadCharts();

    return () => {
      lineChart.current?.destroy();
      donutChart.current?.destroy();
    };
  }, [data]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--glass-border)', borderTopColor: 'var(--color-accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--color-text-secondary)' }}>Memuat laporan...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const { summary, byType, topSpaces, monthlyTrend } = data ?? { summary: { totalIncome: 0, totalBookings: 0, avgPerBooking: 0, totalHours: 0 }, byType: {}, topSpaces: [], monthlyTrend: [] };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>📊 Laporan Pendapatan</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Data reservasi yang sudah aktif dan selesai</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <DollarSign size={20} />, label: 'Total Pendapatan', value: formatCurrencyFull(summary.totalIncome), sub: 'Dari semua reservasi selesai/aktif', color: '#8b5cf6' },
          { icon: <BarChart2 size={20} />, label: 'Total Booking', value: summary.totalBookings.toString(), sub: 'Reservasi aktif & selesai', color: '#3b82f6' },
          { icon: <TrendingUp size={20} />, label: 'Rata-rata / Booking', value: formatCurrencyFull(summary.avgPerBooking), sub: 'Nilai rata-rata setiap transaksi', color: '#06b6d4' },
          { icon: <Clock size={20} />, label: 'Total Jam Terpakai', value: `${summary.totalHours} jam`, sub: 'Akumulasi waktu sewa', color: '#f59e0b' },
        ].map((card) => (
          <div key={card.label} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: card.color, marginBottom: '0.25rem' }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Line Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Tren Pendapatan 12 Bulan Terakhir</h2>
          {monthlyTrend.every((m) => m.income === 0) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, color: 'var(--color-text-secondary)' }}>
              <BarChart2 size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.875rem' }}>Belum ada data pendapatan</p>
            </div>
          ) : (
            <canvas ref={lineRef} style={{ maxHeight: 280 }} />
          )}
        </div>

        {/* Donut Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Distribusi per Tipe Ruangan</h2>
          <canvas ref={donutRef} />
          {/* Breakdown table */}
          {Object.keys(byType).length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(byType).map(([tipe, val], i) => (
                <div key={tipe} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: TYPE_COLORS[i] ?? '#94a3b8', display: 'inline-block' }} />
                    {TYPE_LABELS[tipe] ?? tipe}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{val.count} booking</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Table + Top Spaces */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Per-type breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Rincian per Tipe Ruangan</h2>
          {Object.keys(byType).length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Belum ada data.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '0.75rem' }}>Tipe</th>
                  <th style={{ textAlign: 'right', paddingBottom: '0.75rem' }}>Booking</th>
                  <th style={{ textAlign: 'right', paddingBottom: '0.75rem' }}>Jam</th>
                  <th style={{ textAlign: 'right', paddingBottom: '0.75rem' }}>Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byType).map(([tipe, val]) => (
                  <tr key={tipe} style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.65rem 0' }}>{TYPE_LABELS[tipe] ?? tipe}</td>
                    <td style={{ textAlign: 'right', padding: '0.65rem 0', color: 'var(--color-text-secondary)' }}>{val.count}</td>
                    <td style={{ textAlign: 'right', padding: '0.65rem 0', color: 'var(--color-text-secondary)' }}>{val.hours} j</td>
                    <td style={{ textAlign: 'right', padding: '0.65rem 0', fontWeight: 600 }}>{formatCurrency(val.income)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Spaces */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={16} style={{ color: '#f59e0b' }} /> Ruangan Terpopuler
          </h2>
          {topSpaces.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Belum ada data.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topSpaces.map((s, i) => (
                <div key={s.nama} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#f59e0b22' : 'rgba(255,255,255,0.06)', color: i === 0 ? '#f59e0b' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nama}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.count} booking · {formatCurrency(s.income)}</div>
                  </div>
                  {/* mini bar */}
                  <div style={{ width: 60, height: 6, borderRadius: 999, background: 'var(--glass-border)', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ height: '100%', background: 'var(--gradient-accent)', width: `${Math.min(100, (s.count / (topSpaces[0]?.count || 1)) * 100)}%`, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
