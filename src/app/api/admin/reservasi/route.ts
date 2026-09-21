import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return true;
}

// GET /api/admin/reservasi
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    const reservasi = await prisma.reservasi.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(month && year && {
          tanggalReservasi: {
            gte: new Date(`${year}-${String(month).padStart(2, '0')}-01`),
            lt: new Date(`${year}-${String(Number(month) + 1).padStart(2, '0')}-01`),
          },
        }),
      },
      include: {
        member: { select: { namaMember: true, telp: true } },
        space: { select: { namaSpace: true, tipe: true } },
        diskon: { select: { namaDiskon: true, persentaseDiskon: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ status: true, data: reservasi });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
