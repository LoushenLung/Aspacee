import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterMemberSchema, RegisterAdminSchema } from '@/lib/validations';
import { verifyEmailAvailability } from '@/lib/email-verifier';
import { checkRateLimit, getClientIp, SECURITY_POLICIES } from '@/lib/security';

// ============================================================
// POST /api/auth/register/[type]
// ============================================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(
      `register:${ip}`,
      SECURITY_POLICIES.MAX_REGISTER_ATTEMPTS_PER_MINUTE,
      60 * 1000
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          status: false,
          message: 'Terlalu banyak percobaan registrasi dari perangkat ini. Silakan tunggu 1 menit.',
        },
        { status: 429 }
      );
    }

    const { type } = await params;
    const body = await req.json();

    if (type === 'member') {
      const parsed = RegisterMemberSchema.safeParse(body);
      if (!parsed.success) {
        const errorMessages = Object.values(parsed.error.flatten().fieldErrors)
          .flat()
          .join(', ');
        return NextResponse.json(
          {
            status: false,
            message: errorMessages || 'Validasi data registrasi gagal',
            errors: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }

      const { username, email, password, namaMember, instansi, telp, alamat } = parsed.data;

      // 1. Verify Email (format, domain MX/A existence, and database availability)
      const emailCheck = await verifyEmailAvailability(email);
      if (!emailCheck.valid) {
        return NextResponse.json(
          { status: false, message: emailCheck.message || 'Alamat email tidak valid atau sudah digunakan.' },
          { status: 400 }
        );
      }

      // 2. Verify Username uniqueness
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return NextResponse.json(
          { status: false, message: 'Username sudah digunakan oleh akun lain.' },
          { status: 409 }
        );
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          username,
          email: email.trim().toLowerCase(),
          password: hashed,
          role: 'member',
          member: { create: { namaMember, instansi, telp, alamat } },
        },
        include: { member: true },
      });

      return NextResponse.json(
        {
          status: true,
          message: 'Registrasi member berhasil. Akun Anda telah aktif.',
          data: { id: user.id, username: user.username, email: user.email, role: user.role },
        },
        { status: 201 }
      );

    } else if (type === 'admin-space') {
      const parsed = RegisterAdminSchema.safeParse(body);
      if (!parsed.success) {
        const errorMessages = Object.values(parsed.error.flatten().fieldErrors)
          .flat()
          .join(', ');
        return NextResponse.json(
          {
            status: false,
            message: errorMessages || 'Validasi data registrasi gagal',
            errors: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }

      const { username, email, password, namaCoworking, namaPemilik, telp, alamat } = parsed.data;

      // 1. Verify Email (format, domain MX/A existence, and database availability)
      const emailCheck = await verifyEmailAvailability(email);
      if (!emailCheck.valid) {
        return NextResponse.json(
          { status: false, message: emailCheck.message || 'Alamat email tidak valid atau sudah digunakan.' },
          { status: 400 }
        );
      }

      // 2. Verify Username uniqueness
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return NextResponse.json(
          { status: false, message: 'Username sudah digunakan oleh akun lain.' },
          { status: 409 }
        );
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          username,
          email: email.trim().toLowerCase(),
          password: hashed,
          role: 'admin_space',
          spaceOwner: { create: { namaCoworking, namaPemilik, telp, alamat } },
        },
        include: { spaceOwner: true },
      });

      return NextResponse.json(
        {
          status: true,
          message: 'Registrasi admin coworking berhasil. Akun Anda telah aktif.',
          data: { id: user.id, username: user.username, email: user.email, role: user.role },
        },
        { status: 201 }
      );

    } else {
      return NextResponse.json({ status: false, message: 'Tipe akun tidak valid' }, { status: 400 });
    }
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return NextResponse.json(
      { status: false, message: 'Terjadi kesalahan sistem saat memproses registrasi.' },
      { status: 500 }
    );
  }
}
