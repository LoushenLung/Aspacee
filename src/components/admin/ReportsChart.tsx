"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#6366f1', '#ec4899', '#10b981'];

export default function ReportsChart({
  chartData, distribusiData,
}: {
  chartData: { day: string; total: number }[];
  distribusiData: { name: string; value: number }[];
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-6)' }}>
      {/* Bar Chart */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-lg)' }}>Pendapatan Harian</h3>
        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-12)', color: 'var(--color-text-secondary)' }}>Belum ada data untuk bulan ini</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Pendapatan']}
                contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}
                labelStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Chart */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-lg)' }}>Distribusi per Jenis Space</h3>
        {distribusiData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-secondary)' }}>Belum ada data</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={distribusiData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {distribusiData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} contentStyle={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
