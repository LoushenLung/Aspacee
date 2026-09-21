import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return (session.user as any).spaceOwnerId as string;
}

// GET /api/admin/diskon
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
  try {
    const discounts = await prisma.diskon.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ status: true, data: discounts });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/diskon
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
  try {
    const { namaDiskon, kodeDiskon, persentaseDiskon, tanggalAwal, tanggalAkhir } = await req.json();
    const diskon = await prisma.diskon.create({
      data: {
        namaDiskon,
        kodeDiskon: kodeDiskon.toUpperCase(),
        persentaseDiskon,
        tanggalAwal: new Date(tanggalAwal),
        tanggalAkhir: new Date(tanggalAkhir),
      },
    });
    return NextResponse.json({ status: true, message: 'Diskon berhasil ditambahkan', data: diskon }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ status: false, message: 'Kode diskon sudah digunakan' }, { status: 409 });
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
