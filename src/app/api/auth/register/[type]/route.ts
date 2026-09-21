import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterMemberSchema, RegisterAdminSchema } from '@/lib/validations';

// ============================================================
// POST /api/auth/register/member
// ============================================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await req.json();

    if (type === 'member') {
      const parsed = RegisterMemberSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { status: false, message: 'Validasi gagal', errors: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { username, password, namaMember, instansi, telp, alamat } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ status: false, message: 'Username sudah digunakan' }, { status: 409 });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashed,
          role: 'member',
          member: { create: { namaMember, instansi, telp, alamat } },
        },
        include: { member: true },
      });

      return NextResponse.json({
        status: true,
        message: 'Registrasi member berhasil',
        data: { id: user.id, username: user.username, role: user.role },
      }, { status: 201 });

    } else if (type === 'admin-space') {
      const parsed = RegisterAdminSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { status: false, message: 'Validasi gagal', errors: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { username, password, namaCoworking, namaPemilik, telp, alamat } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ status: false, message: 'Username sudah digunakan' }, { status: 409 });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashed,
          role: 'admin_space',
          spaceOwner: { create: { namaCoworking, namaPemilik, telp, alamat } },
        },
        include: { spaceOwner: true },
      });

      return NextResponse.json({
        status: true,
        message: 'Registrasi admin berhasil',
        data: { id: user.id, username: user.username, role: user.role },
      }, { status: 201 });

    } else {
      return NextResponse.json({ status: false, message: 'Tipe tidak valid' }, { status: 400 });
    }
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
