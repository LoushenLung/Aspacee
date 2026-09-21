import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate, getStatusInfo } from '@/lib/utils';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, FileText, QrCode } from 'lucide-react';

export default async function DetailReservasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const memberId = (session?.user as any)?.memberId as string;

  if (!memberId) {
    redirect('/login');
  }

  const reservasi = await prisma.reservasi.findUnique({
    where: {
      id: id,
      memberId: memberId, // Ensure member can only see their own reservation
    },
    include: {
      space: {
        include: {
          owner: true
        }
      },
      diskon: true,
    }
  });

  if (!reservasi) {
    notFound();
  }

  const status = getStatusInfo(reservasi.status);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)', fontSize: 'var(--font-size-sm)' }}>
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-8)', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
            Detail Reservasi
            <span style={{ 
              padding: '4px var(--spacing-4)', borderRadius: 'var(--radius-full)', 
              fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', 
              background: status.bg, color: status.color.replace('text-', '') 
            }}>
              {status.label}
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontFamily: 'monospace', fontSize: 'var(--font-size-base)' }}>
            Booking ID: <span style={{ color: 'var(--color-accent-primary)', fontWeight: 'var(--font-weight-bold)' }}>{reservasi.kodeBooking}</span>
          </p>
        </div>
        <Link
          href={`/dashboard/reservasi/${reservasi.id}/e-ticket`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)',
            padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-accent)', color: 'white',
            textDecoration: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)',
          }}
        >
          <QrCode size={16} /> Lihat E-Ticket
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-6)' }}>
        
        {/* Detail Space & Waktu */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-6)', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--spacing-4)' }}>Informasi Ruangan & Waktu</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-6)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
                <MapPin size={16} /> Ruangan
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>{reservasi.space.namaSpace}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{reservasi.space.owner.namaCoworking}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
                <Calendar size={16} /> Tanggal
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
                {formatDate(reservasi.tanggalReservasi)}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
                <Clock size={16} /> Waktu
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
                {reservasi.jamMulai} - {reservasi.jamSelesai}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>({reservasi.durasiJam} jam)</div>
            </div>
          </div>

          {reservasi.catatan && (
            <div style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: '1px dotted var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
                <FileText size={16} /> Catatan Tambahan
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>{reservasi.catatan}</div>
            </div>
          )}
        </div>

        {/* Rincian Pembayaran */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-6)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <CreditCard size={20} className="text-gradient" /> Rincian Pembayaran
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Harga Sewa Ruangan ({reservasi.durasiJam} jam)</span>
              <span>{formatCurrency(Number(reservasi.totalHargaAwal))}</span>
            </div>

            {reservasi.potonganDiskon > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Diskon {reservasi.diskon?.namaDiskon ? `(${reservasi.diskon.namaDiskon})` : ''}</span>
                <span style={{ color: 'var(--color-success)' }}>-{formatCurrency(Number(reservasi.potonganDiskon))}</span>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)', margin: 'var(--spacing-2) 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              <span>Total Pembayaran</span>
              <span className="text-gradient">{formatCurrency(Number(reservasi.totalBayar))}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
