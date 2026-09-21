import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CreateReservasiSchema } from '@/lib/validations';
import { generateBookingCode, calculateEndTime, calculatePricing } from '@/lib/utils';

// POST /api/reservasi - Create reservation (Member only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'member') {
      return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
    }

    const memberId = (session.user as any).memberId;
    if (!memberId) {
      return NextResponse.json({ status: false, message: 'Profil member tidak ditemukan' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = CreateReservasiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: false, message: 'Validasi gagal', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { spaceId, tanggalReservasi, jamMulai, durasiJam, kodeDiskon, catatan } = parsed.data;

    // Validate space exists
    const space = await prisma.space.findUnique({ where: { id: spaceId, isActive: true } });
    if (!space) {
      return NextResponse.json({ status: false, message: 'Space tidak ditemukan' }, { status: 404 });
    }

    const jamSelesai = calculateEndTime(jamMulai, durasiJam);

    // Check availability
    const conflict = await prisma.reservasi.findFirst({
      where: {
        spaceId,
        tanggalReservasi: new Date(tanggalReservasi),
        status: { in: ['belum_dikonfirm', 'disetujui', 'aktif'] },
        OR: [
          { jamMulai: { lte: jamMulai }, jamSelesai: { gt: jamMulai } },
          { jamMulai: { lt: jamSelesai }, jamSelesai: { gte: jamSelesai } },
          { jamMulai: { gte: jamMulai }, jamSelesai: { lte: jamSelesai } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { status: false, message: 'Space sudah dipesan pada waktu tersebut' },
        { status: 409 }
      );
    }

    // Validate discount code if provided
    let diskon = null;
    if (kodeDiskon) {
      const now = new Date();
      diskon = await prisma.diskon.findFirst({
        where: {
          kodeDiskon: kodeDiskon.toUpperCase(),
          tanggalAwal: { lte: now },
          tanggalAkhir: { gte: now },
        },
      });

      if (!diskon) {
        return NextResponse.json(
          { status: false, message: 'Kode promo tidak valid atau sudah kadaluarsa' },
          { status: 400 }
        );
      }
    }

    // Calculate pricing
    const { totalHargaAwal, potonganDiskon, totalBayar } = calculatePricing(
      space.hargaPerJam,
      durasiJam,
      diskon?.persentaseDiskon
    );

    const kodeBooking = generateBookingCode();

    // Create reservation with detail
    const reservasi = await prisma.reservasi.create({
      data: {
        kodeBooking,
        tanggalReservasi: new Date(tanggalReservasi),
        jamMulai,
        jamSelesai,
        durasiJam,
        hargaPerJam: space.hargaPerJam,
        totalHargaAwal,
        potonganDiskon,
        totalBayar,
        catatan,
        memberId,
        spaceId,
        ...(diskon && { diskonId: diskon.id }),
        detail: {
          create: {
            spaceId,
            ...(diskon && { diskonId: diskon.id }),
            totalHarga: totalBayar,
          },
        },
      },
      include: {
        space: { select: { namaSpace: true, tipe: true } },
        diskon: { select: { namaDiskon: true, persentaseDiskon: true } },
      },
    });

    return NextResponse.json({
      status: true,
      message: 'Reservasi berhasil dibuat',
      data: reservasi,
    }, { status: 201 });
  } catch (error) {
    console.error('[RESERVASI CREATE ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// GET /api/reservasi - Get member's reservations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'member') {
      return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
    }

    const memberId = (session.user as any).memberId;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const reservasi = await prisma.reservasi.findMany({
      where: {
        memberId,
        ...(month && year && {
          tanggalReservasi: {
            gte: new Date(`${year}-${String(month).padStart(2, '0')}-01`),
            lt: new Date(`${year}-${String(Number(month) + 1).padStart(2, '0')}-01`),
          },
        }),
      },
      include: {
        space: { select: { namaSpace: true, tipe: true, foto: true } },
        diskon: { select: { namaDiskon: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ status: true, message: 'Berhasil', data: reservasi });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
