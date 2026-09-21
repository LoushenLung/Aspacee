import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/spaces - List all spaces with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipe = searchParams.get('tipe');
    const search = searchParams.get('search');

    const spaces = await prisma.space.findMany({
      where: {
        isActive: true,
        ...(tipe && { tipe: tipe as any }),
        ...(search && {
          OR: [
            { namaSpace: { contains: search } },
            { deskripsi: { contains: search } },
          ],
        }),
      },
      include: {
        owner: {
          select: { namaCoworking: true, alamat: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ status: true, message: 'Berhasil', data: spaces });
  } catch (error) {
    console.error('[SPACES GET ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
