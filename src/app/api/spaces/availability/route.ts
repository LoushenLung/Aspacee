import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/spaces/availability?spaceId=&tanggal=&jamMulai=&durasiJam=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get('spaceId');
    const tanggal = searchParams.get('tanggal'); // YYYY-MM-DD
    const jamMulai = searchParams.get('jamMulai'); // HH:mm
    const durasiJam = parseInt(searchParams.get('durasiJam') ?? '1');

    if (!spaceId || !tanggal || !jamMulai) {
      return NextResponse.json(
        { status: false, message: 'Parameter spaceId, tanggal, dan jamMulai wajib diisi' },
        { status: 400 }
      );
    }

    // Calculate end time
    const [hours, minutes] = jamMulai.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durasiJam * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const jamSelesai = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    // Check for conflicting reservations (active or approved)
    const conflict = await prisma.reservasi.findFirst({
      where: {
        spaceId,
        tanggalReservasi: new Date(tanggal),
        status: { in: ['belum_dikonfirm', 'disetujui', 'aktif'] },
        OR: [
          // New booking starts during existing booking
          { jamMulai: { lte: jamMulai }, jamSelesai: { gt: jamMulai } },
          // New booking ends during existing booking
          { jamMulai: { lt: jamSelesai }, jamSelesai: { gte: jamSelesai } },
          // New booking completely overlaps existing booking
          { jamMulai: { gte: jamMulai }, jamSelesai: { lte: jamSelesai } },
        ],
      },
    });

    const isAvailable = !conflict;

    return NextResponse.json({
      status: true,
      message: isAvailable ? 'Space tersedia' : 'Space sudah dipesan pada waktu tersebut',
      data: {
        isAvailable,
        spaceId,
        tanggal,
        jamMulai,
        jamSelesai,
        durasiJam,
      },
    });
  } catch (error) {
    console.error('[AVAILABILITY ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
