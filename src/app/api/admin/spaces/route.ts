import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') {
    return { error: NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 }) };
  }
  return { session, spaceOwnerId: (session.user as any).spaceOwnerId as string };
}

// GET /api/admin/spaces
export async function GET(req: NextRequest) {
  const check = await requireAdmin(req);
  if ('error' in check) return check.error;

  try {
    const spaces = await prisma.space.findMany({
      where: { ownerId: check.spaceOwnerId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ status: true, data: spaces });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST /api/admin/spaces
export async function POST(req: NextRequest) {
  const check = await requireAdmin(req);
  if ('error' in check) return check.error;

  try {
    const body = await req.json();
    const { namaSpace, hargaPerJam, tipe, kapasitas, deskripsi, fasilitas, foto } = body;

    const space = await prisma.space.create({
      data: {
        namaSpace,
        hargaPerJam,
        tipe,
        kapasitas: parseInt(kapasitas),
        deskripsi,
        fasilitas: fasilitas ? JSON.stringify(fasilitas) : null,
        foto,
        ownerId: check.spaceOwnerId,
      },
    });

    return NextResponse.json({ status: true, message: 'Space berhasil ditambahkan', data: space }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
