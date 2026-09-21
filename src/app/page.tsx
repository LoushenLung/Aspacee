import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SpaceCard from '@/components/SpaceCard';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  // Fetch live data from database
  const [spaces, activeDiscounts, session] = await Promise.all([
    prisma.space.findMany({
      where: { isActive: true },
      include: { owner: { select: { namaCoworking: true } } },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.diskon.findMany({
      where: {
        tanggalAwal: { lte: new Date() },
        tanggalAkhir: { gte: new Date() },
      },
      take: 3,
    }),
    auth(),
  ]);

  const spaceTypeColors: Record<string, { color: string; bg: string }> = {
    desk: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    meeting_room: { color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    private_office: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  };

  return (
    <>
      <Navbar session={session} />
      <main>
        {/* === HERO SECTION === */}
        <section style={{
          paddingTop: '120px', paddingBottom: 'var(--spacing-24)',
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '20%', left: '5%', width: '450px', height: '450px', background: 'var(--color-accent-primary)', filter: 'blur(160px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '350px', height: '350px', background: 'var(--color-accent-tertiary)', filter: 'blur(140px)', opacity: 0.12, borderRadius: '50%', zIndex: 0 }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            {activeDiscounts.length > 0 && (
              <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-full)', padding: 'var(--spacing-2) var(--spacing-4)', marginBottom: 'var(--spacing-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-accent-primary)' }}>
                <Zap size={14} fill="currentColor" />
                Promo aktif: <strong>{activeDiscounts[0].namaDiskon}</strong> — diskon {Number(activeDiscounts[0].persentaseDiskon)}%!
              </div>
            )}

            <div style={{ maxWidth: '750px' }}>
              <h1 className="animate-fade-in" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 'var(--spacing-6)', lineHeight: 1.1 }}>
                Temukan Ruang Kerja Ideal di <span className="text-gradient">Ur-Space</span>
              </h1>
              <p className="animate-fade-in delay-100" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-8)', maxWidth: '550px' }}>
                Coworking space premium untuk freelancer, startup, dan profesional. Reservasi mudah, fleksibel, dan efisien.
              </p>
              <div className="animate-fade-in delay-200" style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                <Link href="#spaces" className="btn btn-primary" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)', textDecoration: 'none', gap: 'var(--spacing-2)' }}>
                  Lihat Space <ArrowRight size={18} />
                </Link>
                <Link href="/register" className="btn btn-secondary" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)', textDecoration: 'none' }}>
                  Daftar Gratis
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-12)', flexWrap: 'wrap' }}>
              {[['3+', 'Jenis Space'], ['100%', 'Online Booking'], ['24/7', 'Akses Tersedia']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }} className="text-gradient">{num}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SPACE LISTING === */}
        <section id="spaces" style={{ padding: 'var(--spacing-16) 0', background: 'var(--color-bg-secondary)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
              <h2 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
                Pilih <span className="text-gradient">Space</span> Terbaik
              </h2>
              <p style={{ fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
                Tersedia berbagai pilihan ruangan yang bisa disesuaikan dengan kebutuhan kerja Anda.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-6)' }}>
              {spaces.map((space) => {
                const typeStyle = spaceTypeColors[space.tipe] ?? { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' };
                return (
                  <SpaceCard key={space.id} space={space} typeStyle={typeStyle} />
                );
              })}
            </div>

            {spaces.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-16)', color: 'var(--color-text-secondary)' }}>
                <p>Belum ada space tersedia. Silakan kembali lagi nanti.</p>
              </div>
            )}
          </div>
        </section>

        {/* === PROMO SECTION === */}
        {activeDiscounts.length > 0 && (
          <section style={{ padding: 'var(--spacing-16) 0' }}>
            <div className="container">
              <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-8)', textAlign: 'center' }}>
                🎉 Promo <span className="text-gradient">Aktif Sekarang</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-4)' }}>
                {activeDiscounts.map(d => (
                  <div key={d.id} style={{
                    padding: 'var(--spacing-6)', borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}>
                    <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-2)' }} className="text-gradient">{Number(d.persentaseDiskon)}% OFF</div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-1)' }}>{d.namaDiskon}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
                      Berlaku hingga {new Date(d.tanggalAkhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontFamily: 'monospace', background: 'var(--color-bg-tertiary)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', letterSpacing: '0.1em', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-accent-primary)', display: 'inline-block' }}>
                      {d.kodeDiskon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
