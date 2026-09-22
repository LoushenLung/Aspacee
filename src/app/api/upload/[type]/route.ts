import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

const VALID_TYPES = ['spaces', 'members', 'general'] as const;
type UploadType = typeof VALID_TYPES[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
    }

    const { type } = await params;
    if (!VALID_TYPES.includes(type as UploadType)) {
      return NextResponse.json({ status: false, message: 'Tipe upload tidak valid' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ status: false, message: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ status: false, message: 'Hanya file gambar (JPG, PNG, WebP) yang diizinkan' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ status: false, message: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Create directory if not exists
    const baseUploadDir = join(process.cwd(), 'public', 'uploads', type);
    await mkdir(baseUploadDir, { recursive: true });

    const filePath = join(baseUploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/${type}/${filename}`;

    return NextResponse.json({
      status: true,
      message: 'Upload berhasil',
      data: { filename, url },
    }, { status: 201 });

  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
