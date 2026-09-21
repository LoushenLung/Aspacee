import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return true;
}

// PUT /api/admin/diskon/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
  try {
    const { id } = await params;
    const { namaDiskon, kodeDiskon, persentaseDiskon, tanggalAwal, tanggalAkhir } = await req.json();
    const diskon = await prisma.diskon.update({
      where: { id },
      data: {
        namaDiskon,
        kodeDiskon: kodeDiskon?.toUpperCase(),
        persentaseDiskon,
        tanggalAwal: tanggalAwal ? new Date(tanggalAwal) : undefined,
        tanggalAkhir: tanggalAkhir ? new Date(tanggalAkhir) : undefined,
      },
    });
    return NextResponse.json({ status: true, message: 'Diskon berhasil diperbarui', data: diskon });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ status: false, message: 'Kode diskon sudah digunakan' }, { status: 409 });
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/diskon/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.diskon.delete({ where: { id } });
    return NextResponse.json({ status: true, message: 'Diskon berhasil dihapus' });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
