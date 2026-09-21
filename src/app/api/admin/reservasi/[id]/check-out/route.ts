import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return true;
}

// POST /api/admin/reservasi/[id]/check-out
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const { id } = await params;
    const reservasi = await prisma.reservasi.findUnique({ where: { id } });

    if (!reservasi) return NextResponse.json({ status: false, message: 'Reservasi tidak ditemukan' }, { status: 404 });
    if (reservasi.status !== 'aktif') {
      return NextResponse.json({ status: false, message: 'Reservasi harus berstatus aktif untuk check-out' }, { status: 400 });
    }

    const updated = await prisma.reservasi.update({
      where: { id },
      data: { status: 'selesai', checkOutAt: new Date() },
    });

    return NextResponse.json({ status: true, message: 'Check-out berhasil. Terima kasih!', data: updated });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
