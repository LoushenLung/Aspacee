import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PATCH /api/reservasi/[id]/cancel
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: 'Silakan login terlebih dahulu' }, { status: 401 });

  const memberId = (session.user as any)?.memberId as string;
  if (!memberId) return NextResponse.json({ success: false, message: 'Akses ditolak: bukan member' }, { status: 403 });

  try {
    const { id } = await params;
    const reservasi = await prisma.reservasi.findUnique({ where: { id } });

    if (!reservasi) {
      return NextResponse.json({ success: false, message: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    // Ownership check
    if (reservasi.memberId !== memberId) {
      return NextResponse.json({ success: false, message: 'Anda tidak berhak membatalkan reservasi ini' }, { status: 403 });
    }

    // Only allow cancel if still pending
    if (reservasi.status !== 'belum_dikonfirm') {
      return NextResponse.json({
        success: false,
        message: `Reservasi tidak dapat dibatalkan. Status saat ini: "${reservasi.status}". Hanya reservasi yang belum dikonfirm yang dapat dibatalkan.`,
      }, { status: 400 });
    }

    const updated = await prisma.reservasi.update({
      where: { id },
      data: { status: 'dibatalkan' },
    });

    return NextResponse.json({ success: true, message: 'Reservasi berhasil dibatalkan', data: updated });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
