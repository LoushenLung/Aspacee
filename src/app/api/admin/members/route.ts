import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin_space') return null;
  return true;
}

// GET /api/admin/members
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
  try {
    const members = await prisma.member.findMany({
      include: { user: { select: { username: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ status: true, data: members });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/members
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
  try {
    const { username, password, namaMember, instansi, telp, alamat } = await req.json();
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ status: false, message: 'Username sudah digunakan' }, { status: 409 });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username, password: hashed, role: 'member',
        member: { create: { namaMember, instansi, telp, alamat } },
      },
      include: { member: true },
    });
    return NextResponse.json({ status: true, message: 'Member berhasil ditambahkan', data: user }, { status: 201 });
  } catch {
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}
