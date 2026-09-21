import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return { session, spaceOwnerId: (session.user as any).spaceOwnerId as string };
}

// GET /api/admin/spaces/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (!check) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const { id } = await params;
    const space = await prisma.space.findFirst({ where: { id, ownerId: check.spaceOwnerId } });
    if (!space) return NextResponse.json({ status: false, message: 'Space tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ status: true, data: space });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/admin/spaces/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (!check) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { namaSpace, hargaPerJam, tipe, kapasitas, deskripsi, fasilitas, foto, isActive } = body;

    const space = await prisma.space.updateMany({
      where: { id, ownerId: check.spaceOwnerId },
      data: {
        ...(namaSpace && { namaSpace }),
        ...(hargaPerJam !== undefined && { hargaPerJam }),
        ...(tipe && { tipe }),
        ...(kapasitas !== undefined && { kapasitas: parseInt(kapasitas) }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(fasilitas !== undefined && { fasilitas: JSON.stringify(fasilitas) }),
        ...(foto !== undefined && { foto }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    if (space.count === 0) {
      return NextResponse.json({ status: false, message: 'Space tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ status: true, message: 'Space berhasil diperbarui' });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/spaces/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (!check) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const { id } = await params;
    // Soft delete (set isActive = false)
    await prisma.space.updateMany({
      where: { id, ownerId: check.spaceOwnerId },
      data: { isActive: false },
    });
    return NextResponse.json({ status: true, message: 'Space berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
