import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return true;
}

// GET /api/admin/reports/monthly?month=&year=
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));

    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const endDate = new Date(`${year}-${String(month + 1).padStart(2, '0')}-01`);

    const reservasi = await prisma.reservasi.findMany({
      where: {
        tanggalReservasi: { gte: startDate, lt: endDate },
        status: 'selesai',
      },
      include: { space: { select: { tipe: true } } },
    });

    const totalPendapatan = reservasi.reduce((acc, r) => acc + Number(r.totalBayar), 0);
    const totalReservasi = reservasi.length;

    // Distribution by space type
    const distribusi = reservasi.reduce((acc: Record<string, number>, r) => {
      const tipe = r.space.tipe;
      acc[tipe] = (acc[tipe] ?? 0) + Number(r.totalBayar);
      return acc;
    }, {});

    return NextResponse.json({
      status: true,
      data: {
        month,
        year,
        totalPendapatan,
        totalReservasi,
        distribusiPerTipe: distribusi,
      },
    });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
