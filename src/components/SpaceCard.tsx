"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Users } from 'lucide-react';
import { formatCurrency, getSpaceTypeLabel, getImageUrl } from '@/lib/utils';

interface SpaceCardProps {
  space: {
    id: string;
    namaSpace: string;
    hargaPerJam: number | string;
    tipe: string;
    kapasitas: number;
    fasilitas?: string | null;
    foto?: string | null;
  };
  typeStyle: { color: string; bg: string };
}

export default function SpaceCard({ space, typeStyle }: SpaceCardProps) {
  const fasilitas: string[] = space.fasilitas ? JSON.parse(space.fasilitas) : [];

  return (
    <div
      className="glass-panel"
      style={{ overflow: 'hidden', transition: 'transform var(--transition-normal)', cursor: 'pointer' }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ height: '200px', position: 'relative', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {space.foto ? (
          <Image src={getImageUrl('spaces', space.foto)} alt={space.namaSpace} fill style={{ objectFit: 'cover' }} unoptimized />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)', opacity: 0.4 }}>
            <Users size={48} />
            <span style={{ fontSize: 'var(--font-size-sm)' }}>No image</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 'var(--spacing-3)', left: 'var(--spacing-3)', padding: '4px var(--spacing-3)', borderRadius: 'var(--radius-full)', background: typeStyle.bg, color: typeStyle.color, fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', backdropFilter: 'blur(8px)' }}>
          {getSpaceTypeLabel(space.tipe)}
        </div>
      </div>

      <div style={{ padding: 'var(--spacing-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-3)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{space.namaSpace}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
              <Users size={12} /> Kapasitas {space.kapasitas} orang
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>{formatCurrency(Number(space.hargaPerJam))}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>per jam</div>
          </div>
        </div>

        {fasilitas.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
            {fasilitas.slice(0, 3).map(f => (
              <span key={f} style={{ fontSize: 'var(--font-size-xs)', padding: '2px var(--spacing-2)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{f}</span>
            ))}
            {fasilitas.length > 3 && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>+{fasilitas.length - 3} lainnya</span>}
          </div>
        )}

        <Link href={`/spaces/${space.id}`} className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
          Lihat Detail & Booking
        </Link>
      </div>
    </div>
  );
}
