import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return true;
}

// PATCH /api/admin/reservasi/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await req.json();

    const updated = await prisma.reservasi.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ status: true, message: `Status diubah ke ${status}`, data: updated });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
