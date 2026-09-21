import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return session;
}

// GET /api/admin/reports/dashboard
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalSpaces, totalMembers, todayBookings, monthIncomeAgg] = await Promise.all([
      prisma.space.count({ where: { isActive: true } }),
      prisma.member.count(),
      prisma.reservasi.count({ where: { createdAt: { gte: today, lte: todayEnd } } }),
      prisma.reservasi.aggregate({
        where: { status: { in: ['aktif', 'selesai'] }, createdAt: { gte: firstOfMonth } },
        _sum: { totalBayar: true },
      }),
    ]);

    // Weekly trend (last 7 days)
    const weeklyTrend: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);
      const count = await prisma.reservasi.count({ where: { createdAt: { gte: d, lte: dEnd } } });
      weeklyTrend.push({ day: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }), count });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalSpaces,
        totalMembers,
        todayBookings,
        monthIncome: Number(monthIncomeAgg._sum.totalBayar ?? 0),
        weeklyTrend,
      },
    });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
