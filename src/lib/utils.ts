import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Utility to merge Tailwind CSS class names cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique booking code
 * Format: URSPyymmdd-XXXXX (uppercase alphanumeric)
 */
export function generateBookingCode(): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `URSP${yy}${mm}${dd}-${rand}`;
}

/**
 * Format currency to IDR
 */
export function formatCurrency(amount: number | Decimal): string {
  const num = typeof amount === 'object' ? Number(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date short (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Calculate end time from start time and duration
 * @param startTime - HH:mm string
 * @param durationHours - duration in hours (integer)
 */
export function calculateEndTime(startTime: string, durationHours: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationHours * 60;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

/**
 * Calculate reservation pricing
 */
export function calculatePricing(
  hargaPerJam: number | Decimal,
  durasiJam: number,
  persentaseDiskon?: number | Decimal | null
) {
  const price = typeof hargaPerJam === 'object' ? Number(hargaPerJam) : hargaPerJam;
  const totalHargaAwal = price * durasiJam;
  const potongan = persentaseDiskon
    ? totalHargaAwal * (Number(persentaseDiskon) / 100)
    : 0;
  const totalBayar = totalHargaAwal - potongan;
  return { totalHargaAwal, potonganDiskon: potongan, totalBayar };
}

/**
 * Get space type label in Indonesian
 */
export function getSpaceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    desk: 'Personal Desk',
    meeting_room: 'Meeting Room',
    private_office: 'Private Office',
  };
  return labels[type] ?? type;
}

/**
 * Get reservation status label and color in Indonesian
 */
export function getStatusInfo(status: string) {
  const info: Record<string, { label: string; color: string; bg: string }> = {
    belum_dikonfirm: { label: 'Menunggu Konfirmasi', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    disetujui: { label: 'Disetujui', color: 'text-blue-600', bg: 'bg-blue-100' },
    aktif: { label: 'Sedang Digunakan', color: 'text-green-600', bg: 'bg-green-100' },
    selesai: { label: 'Selesai', color: 'text-gray-600', bg: 'bg-gray-100' },
    dibatalkan: { label: 'Dibatalkan', color: 'text-red-600', bg: 'bg-red-100' },
  };
  return info[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
}

/**
 * Get upload URL for images
 */
export function getImageUrl(type: 'spaces' | 'members' | 'general', filename?: string | null): string {
  if (!filename) return '/placeholder-image.svg';
  if (filename.startsWith('http')) return filename;
  return `/uploads/${type}/${filename}`;
}
