import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Building2, Users, CalendarCheck, TrendingUp, Clock, Plus, ListChecks } from 'lucide-react';
import Link from 'next/link';
import AdminWeeklyChart from '@/components/AdminWeeklyChart';

export default async function AdminDashboard() {
  const session = await auth();
  const spaceOwnerId = (session?.user as any)?.spaceOwnerId as string;
  const adminName = (session?.user as any)?.username ?? 'Admin';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [totalSpaces, totalMembers, pendingCount, monthIncome] = await Promise.all([
    prisma.space.count({ where: { ownerId: spaceOwnerId, isActive: true } }),
    prisma.member.count(),
    prisma.reservasi.count({ where: { status: 'belum_dikonfirm' } }),
    prisma.reservasi.aggregate({
      where: { status: { in: ['aktif', 'selesai'] }, createdAt: { gte: firstOfMonth } },
      _sum: { totalBayar: true },
    }),
  ]);

  const recentReservasi = await prisma.reservasi.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      member: { select: { namaMember: true } },
      space: { select: { namaSpace: true } },
    },
  });

  // Weekly trend for client chart
  const weeklyData: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dEnd = new Date(d);
    dEnd.setHours(23, 59, 59, 999);
    const count = await prisma.reservasi.count({ where: { createdAt: { gte: d, lte: dEnd } } });
    weeklyData.push({ day: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }), count });
  }

  const statCards = [
    { label: 'Space Aktif', value: totalSpaces, icon: Building2, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', link: '/admin/spaces' },
    { label: 'Total Member', value: totalMembers, icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', link: '/admin/members' },
    { label: 'Pending Konfirmasi', value: pendingCount, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', link: '/admin/reservasi' },
    { label: 'Pendapatan Bulan Ini', value: formatCurrency(Number(monthIncome._sum.totalBayar ?? 0)), icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.12)', link: '/admin/laporan' },
  ];

  const statusColors: Record<string, string> = {
    belum_dikonfirm: '#f59e0b', disetujui: '#6366f1', aktif: '#10b981', selesai: '#a0a0b0', dibatalkan: '#ef4444',
  };
  const statusLabels: Record<string, string> = {
    belum_dikonfirm: 'Menunggu', disetujui: 'Disetujui', aktif: 'Aktif', selesai: 'Selesai', dibatalkan: 'Dibatalkan',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Halo, {adminName} 👋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Panel pengelolaan Smart Space Booking · {today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/spaces/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-lg)', background: 'var(--gradient-accent)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <Plus size={15} /> Tambah Space
          </Link>
          <Link href="/admin/reservasi" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-lg)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <ListChecks size={15} /> Lihat Reservasi
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} href={link} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 30px ${color}22`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color }} />
                </div>
                {label === 'Pending Konfirmasi' && Number(value) > 0 && (
                  <span style={{ background: '#f59e0b', color: 'white', borderRadius: '999px', fontSize: '0.7rem', padding: '0.1rem 0.5rem', fontWeight: 700 }}>
                    Perlu tindakan
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + Quick Links Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Weekly chart (client component) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Booking 7 Hari Terakhir</h2>
            <Link href="/admin/laporan" style={{ fontSize: '0.8rem', color: 'var(--color-accent-primary)', textDecoration: 'none' }}>Lihat laporan lengkap →</Link>
          </div>
          <AdminWeeklyChart data={weeklyData} />
        </div>

        {/* Quick Actions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>Aksi Cepat</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { href: '/admin/spaces/create', emoji: '🏢', label: 'Tambah Space Baru' },
              { href: '/admin/reservasi', emoji: '📋', label: 'Kelola Reservasi' },
              { href: '/admin/members', emoji: '👥', label: 'Kelola Member' },
              { href: '/admin/diskon', emoji: '🎫', label: 'Kelola Promo & Diskon' },
              { href: '/admin/laporan', emoji: '📊', label: 'Lihat Laporan' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reservasi Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Reservasi Terbaru</h2>
          <Link href="/admin/reservasi" style={{ fontSize: '0.8rem', color: 'var(--color-accent-primary)', textDecoration: 'none' }}>Lihat semua →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                {['Kode Booking', 'Member', 'Space', 'Tanggal', 'Total', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--glass-border)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentReservasi.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                >
                  <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-accent-primary)' }}>{r.kodeBooking}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>{r.member.namaMember}</td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--color-text-secondary)' }}>{r.space.namaSpace}</td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{new Date(r.tanggalReservasi).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{formatCurrency(Number(r.totalBayar))}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: `${statusColors[r.status]}22`, color: statusColors[r.status], border: `1px solid ${statusColors[r.status]}44` }}>
                      {statusLabels[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {recentReservasi.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Belum ada reservasi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
