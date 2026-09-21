import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return session;
}

// GET /api/admin/checkin/[qrToken]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qrToken: string }> }
) {
  if (!await requireAdmin()) {
    return NextResponse.json({ status: false, message: 'Akses ditolak: Hanya Admin yang dapat memverifikasi QR' }, { status: 401 });
  }

  try {
    const { qrToken } = await params;

    // Search by qrToken or fallback to kodeBooking or id
    const reservasi = await prisma.reservasi.findFirst({
      where: {
        OR: [
          { qrToken },
          { kodeBooking: qrToken },
          { id: qrToken },
        ],
      },
      include: {
        member: {
          select: {
            namaMember: true,
            instansi: true,
            foto: true,
          },
        },
        space: {
          select: {
            namaSpace: true,
            tipe: true,
            owner: {
              select: {
                namaCoworking: true,
              },
            },
          },
        },
      },
    });

    if (!reservasi) {
      return NextResponse.json({ status: false, message: 'Reservasi tidak ditemukan atau QR Code tidak valid' }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: reservasi });
  } catch (error) {
    console.error('[CHECKIN LOOKUP ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server saat memverifikasi QR' }, { status: 500 });
  }
}
