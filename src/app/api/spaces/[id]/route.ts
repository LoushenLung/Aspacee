import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/spaces/[id] - Get space detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const space = await prisma.space.findUnique({
      where: { id, isActive: true },
      include: {
        owner: {
          select: { namaCoworking: true, alamat: true, telp: true },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ status: false, message: 'Space tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: 'Berhasil', data: space });
  } catch (error) {
    console.error('[SPACE DETAIL ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
