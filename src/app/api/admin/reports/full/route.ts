import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return true;
}

// GET /api/admin/reports/full
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const reservations = await prisma.reservasi.findMany({
      where: { status: { in: ['aktif', 'selesai'] } },
      include: { space: true },
      orderBy: { createdAt: 'asc' },
    });

    // Summary
    const totalIncome = reservations.reduce((acc, r) => acc + Number(r.totalBayar), 0);
    const totalBookings = reservations.length;
    const avgPerBooking = totalBookings > 0 ? totalIncome / totalBookings : 0;
    const totalHours = reservations.reduce((acc, r) => acc + r.durasiJam, 0);

    // Revenue per space type
    const byType: Record<string, { count: number; income: number; hours: number }> = {};
    for (const r of reservations) {
      const tipe = r.space.tipe;
      if (!byType[tipe]) byType[tipe] = { count: 0, income: 0, hours: 0 };
      byType[tipe].count += 1;
      byType[tipe].income += Number(r.totalBayar);
      byType[tipe].hours += r.durasiJam;
    }

    // Monthly trend (last 12 months)
    const now = new Date();
    const monthlyTrend: { month: string; income: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
      const filtered = reservations.filter((r) => {
        const rd = new Date(r.createdAt);
        return rd.getFullYear() === year && rd.getMonth() === month;
      });
      monthlyTrend.push({
        month: label,
        income: filtered.reduce((acc, r) => acc + Number(r.totalBayar), 0),
        count: filtered.length,
      });
    }

    // Top spaces
    const spaceMap: Record<string, { nama: string; count: number; income: number }> = {};
    for (const r of reservations) {
      const sid = r.space.id;
      if (!spaceMap[sid]) spaceMap[sid] = { nama: r.space.namaSpace, count: 0, income: 0 };
      spaceMap[sid].count += 1;
      spaceMap[sid].income += Number(r.totalBayar);
    }
    const topSpaces = Object.values(spaceMap).sort((a, b) => b.count - a.count).slice(0, 5);

    return NextResponse.json({
      success: true,
      data: { summary: { totalIncome, totalBookings, avgPerBooking, totalHours }, byType, monthlyTrend, topSpaces },
    });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
