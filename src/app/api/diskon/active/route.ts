import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CheckPromoSchema } from '@/lib/validations';

// GET /api/diskon/active - Get active discounts
export async function GET() {
  try {
    const now = new Date();
    const discounts = await prisma.diskon.findMany({
      where: {
        tanggalAwal: { lte: now },
        tanggalAkhir: { gte: now },
      },
      orderBy: { tanggalAkhir: 'asc' },
    });

    return NextResponse.json({ status: true, message: 'Berhasil', data: discounts });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
