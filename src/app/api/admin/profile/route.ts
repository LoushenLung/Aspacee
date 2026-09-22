import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/admin/profile
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Silakan login terlebih dahulu' }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== 'admin_space') {
    return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
  }

  const userId = session.user?.id;
  const owner = await prisma.spaceOwner.findFirst({
    where: { userId },
  });

  return NextResponse.json({
    success: true,
    data: owner ?? {
      namaCoworking: 'Ur-Space Coworking',
      namaPemilik: session.user?.name ?? 'Admin Space',
      telp: '',
      alamat: '',
      deskripsi: '',
    },
  });
}

// PUT /api/admin/profile
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Silakan login terlebih dahulu' }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== 'admin_space') {
    return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { namaCoworking, namaPemilik, telp, alamat, deskripsi } = body;

    if (!namaCoworking || !namaPemilik) {
      return NextResponse.json({ success: false, message: 'Nama coworking dan nama pemilik wajib diisi' }, { status: 400 });
    }

    const userId = session.user?.id as string;
    const existing = await prisma.spaceOwner.findFirst({ where: { userId } });

    let updated;
    if (existing) {
      updated = await prisma.spaceOwner.update({
        where: { id: existing.id },
        data: {
          namaCoworking,
          namaPemilik,
          telp: telp || null,
          alamat: alamat || null,
          deskripsi: deskripsi || null,
        },
      });
    } else {
      updated = await prisma.spaceOwner.create({
        data: {
          userId,
          namaCoworking,
          namaPemilik,
          telp: telp || null,
          alamat: alamat || null,
          deskripsi: deskripsi || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profil coworking space berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
