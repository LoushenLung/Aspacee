import { auth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Users, ArrowRight, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SpacesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipe?: string; q?: string }>;
}) {
  const session = await auth();
  const { tipe, q } = await searchParams;

  const spaces = await prisma.space.findMany({
    where: {
      isActive: true,
      ...(tipe && tipe !== 'all' ? { tipe } : {}),
      ...(q
        ? {
            OR: [
              { namaSpace: { contains: q, mode: 'insensitive' } },
              { deskripsi: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      owner: { select: { namaCoworking: true, alamat: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const filterTabs = [
    { label: 'Semua Ruang', value: 'all' },
    { label: 'Personal Desk', value: 'desk' },
    { label: 'Meeting Room', value: 'meeting_room' },
    { label: 'Private Office', value: 'private_office' },
  ];

  const currentTipe = tipe || 'all';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar session={session} />

      <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '60px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', borderRadius: '999px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              color: 'var(--color-accent-primary)', fontSize: '0.85rem', fontWeight: 600,
              marginBottom: '1rem',
            }}>
              <Sparkles size={15} /> Ruang Kerja Fleksibel & Nyaman
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, margin: '0 0 1rem' }}>
              Jelajahi Pilihan <span className="text-gradient">Space</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Temukan ruang yang sesuai untuk kebutuhan kerja mandiri, diskusi tim, atau ruang kantor privat Anda.
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
            padding: '1rem', borderRadius: 'var(--radius-xl)',
            background: 'var(--color-bg-secondary)', border: '1px solid var(--glass-border)',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {filterTabs.map((tab) => {
                const isActive = currentTipe === tab.value;
                const href = tab.value === 'all'
                  ? (q ? `/spaces?q=${encodeURIComponent(q)}` : '/spaces')
                  : `/spaces?tipe=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
                return (
                  <Link
                    key={tab.value}
                    href={href}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      background: isActive ? 'var(--gradient-accent)' : 'transparent',
                      color: isActive ? 'white' : 'var(--color-text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            {/* Search Form */}
            <form method="GET" action="/spaces" style={{ display: 'flex', gap: '0.5rem' }}>
              {currentTipe !== 'all' && <input type="hidden" name="tipe" value={currentTipe} />}
              <input
                type="text"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Cari nama ruang..."
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  minWidth: '220px',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cari
              </button>
            </form>
          </div>

          {/* Spaces Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}>
            {spaces.map((space) => {
              let parsedFasilitas: string[] = [];
              if (space.fasilitas) {
                try {
                  parsedFasilitas = JSON.parse(space.fasilitas);
                } catch {
                  parsedFasilitas = space.fasilitas.split(',').map((s) => s.trim());
                }
              }

              const typeBadge =
                space.tipe === 'desk'
                  ? { label: 'Personal Desk', color: '#6366f1' }
                  : space.tipe === 'meeting_room'
                  ? { label: 'Meeting Room', color: '#10b981' }
                  : { label: 'Private Office', color: '#f59e0b' };

              return (
                <div
                  key={space.id}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Badge & Capacity */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: `${typeBadge.color}15`,
                        color: typeBadge.color,
                        border: `1px solid ${typeBadge.color}35`,
                      }}>
                        {typeBadge.label}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        <Users size={14} /> Kapasitas {space.kapasitas} orang
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-text-primary)' }}>
                      {space.namaSpace}
                    </h2>

                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      margin: '0 0 1.25rem',
                      flex: 1,
                    }}>
                      {space.deskripsi || 'Ruang kerja dengan fasilitas modern untuk kenyamanan dan produktivitas Anda.'}
                    </p>

                    {/* Facilities Preview */}
                    {parsedFasilitas.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                        {parsedFasilitas.slice(0, 4).map((fasi, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-bg-tertiary)',
                              fontSize: '0.75rem',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            <CheckCircle2 size={11} style={{ color: '#10b981' }} /> {fasi}
                          </span>
                        ))}
                        {parsedFasilitas.length > 4 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                            +{parsedFasilitas.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    )}

                    <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0 0 1rem' }} />

                    {/* Price and CTA */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Tarif Mulai</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          {formatCurrency(Number(space.hargaPerJam))}
                          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}> / jam</span>
                        </div>
                      </div>

                      <Link
                        href={`/booking?spaceId=${space.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.6rem 1.15rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--gradient-accent)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                        }}
                      >
                        Booking <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {spaces.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-secondary)' }}>
              <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                Tidak ada space yang sesuai kriteria pencarian
              </p>
              <p style={{ fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
                Coba pilih kategori lain atau hapus kata kunci pencarian.
              </p>
              <Link
                href="/spaces"
                style={{
                  display: 'inline-flex',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Lihat Semua Space
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
