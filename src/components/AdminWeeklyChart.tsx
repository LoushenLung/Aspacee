'use client';

import { useEffect, useRef } from 'react';

interface Props {
  data: { day: string; count: number }[];
}

export default function AdminWeeklyChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const init = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      if (chartRef.current) chartRef.current.destroy();

      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx) return;

      const allZero = data.every((d) => d.count === 0);

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map((d) => d.day),
          datasets: [{
            label: 'Booking',
            data: data.map((d) => d.count),
            backgroundColor: allZero ? 'rgba(100,116,139,0.2)' : 'rgba(139,92,246,0.7)',
            hoverBackgroundColor: '#8b5cf6',
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} booking`,
              },
            },
          },
          scales: {
            x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { display: false } },
            y: {
              ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 },
              grid: { color: 'rgba(255,255,255,0.05)' },
              beginAtZero: true,
            },
          },
        },
      });
    };

    init();

    return () => { chartRef.current?.destroy(); };
  }, [data]);

  return (
    <div>
      {data.every((d) => d.count === 0) && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Belum ada booking minggu ini
        </p>
      )}
      <canvas ref={canvasRef} style={{ maxHeight: 200 }} />
    </div>
  );
}
