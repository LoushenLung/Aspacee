import { z } from 'zod';

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const RegisterMemberSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  namaMember: z.string().min(2, 'Nama lengkap wajib diisi'),
  instansi: z.string().optional(),
  telp: z.string().optional(),
  alamat: z.string().optional(),
});

export const RegisterAdminSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  namaCoworking: z.string().min(2, 'Nama coworking space wajib diisi'),
  namaPemilik: z.string().min(2, 'Nama pemilik wajib diisi'),
  telp: z.string().optional(),
  alamat: z.string().optional(),
});

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// ============================================================
// SPACE SCHEMAS
// ============================================================

export const CreateSpaceSchema = z.object({
  namaSpace: z.string().min(2, 'Nama space wajib diisi'),
  hargaPerJam: z.number().positive('Harga harus lebih dari 0'),
  tipe: z.enum(['desk', 'meeting_room', 'private_office']),
  kapasitas: z.number().int().positive('Kapasitas minimal 1'),
  deskripsi: z.string().optional(),
  fasilitas: z.array(z.string()).optional(),
  foto: z.string().optional(),
});

export const UpdateSpaceSchema = CreateSpaceSchema.partial();

// ============================================================
// DISCOUNT SCHEMAS
// ============================================================

export const CreateDiskonSchema = z.object({
  namaDiskon: z.string().min(2, 'Nama diskon wajib diisi'),
  kodeDiskon: z.string().min(3, 'Kode diskon minimal 3 karakter').max(20).toUpperCase(),
  persentaseDiskon: z.number().min(1).max(100, 'Persentase antara 1-100%'),
  tanggalAwal: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  tanggalAkhir: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const UpdateDiskonSchema = CreateDiskonSchema.partial();

export const CheckPromoSchema = z.object({
  kodeDiskon: z.string().min(1, 'Kode promo wajib diisi'),
});

// ============================================================
// RESERVATION SCHEMAS
// ============================================================

export const CreateReservasiSchema = z.object({
  spaceId: z.string().min(1, 'Pilih ruangan terlebih dahulu'),
  tanggalReservasi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  jamMulai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam HH:mm'),
  durasiJam: z.number().int().min(1, 'Durasi minimal 1 jam').max(12, 'Durasi maksimal 12 jam'),
  kodeDiskon: z.string().optional(),
  catatan: z.string().optional(),
});

export const UpdateReservasiStatusSchema = z.object({
  status: z.enum(['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan']),
});

// ============================================================
// ADMIN SCHEMAS
// ============================================================

export const UpdateAdminProfileSchema = z.object({
  namaCoworking: z.string().min(2, 'Nama coworking wajib diisi'),
  namaPemilik: z.string().min(2, 'Nama pemilik wajib diisi'),
  telp: z.string().optional(),
  alamat: z.string().optional(),
  deskripsi: z.string().optional(),
});

export const CreateMemberAdminSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  namaMember: z.string().min(2),
  instansi: z.string().optional(),
  telp: z.string().optional(),
  alamat: z.string().optional(),
});

export const UpdateMemberAdminSchema = z.object({
  namaMember: z.string().min(2).optional(),
  instansi: z.string().optional(),
  telp: z.string().optional(),
  alamat: z.string().optional(),
  foto: z.string().optional(),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type RegisterMemberInput = z.infer<typeof RegisterMemberSchema>;
export type RegisterAdminInput = z.infer<typeof RegisterAdminSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateSpaceInput = z.infer<typeof CreateSpaceSchema>;
export type CreateDiskonInput = z.infer<typeof CreateDiskonSchema>;
export type CheckPromoInput = z.infer<typeof CheckPromoSchema>;
export type CreateReservasiInput = z.infer<typeof CreateReservasiSchema>;
export type UpdateAdminProfileInput = z.infer<typeof UpdateAdminProfileSchema>;
