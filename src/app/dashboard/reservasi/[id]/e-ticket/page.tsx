'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Printer, ArrowLeft, QrCode, Calendar, Clock, MapPin, User, Hash } from 'lucide-react';
import Link from 'next/link';

interface ETicketData {
  id: string;
  kodeBooking: string;
  qrToken: string;
  qrCode: string; // base64 data URL
  tanggalReservasi: string;
  jamMulai: string;
  jamSelesai: string;
  durasiJam: number;
  status: string;
  totalBayar: number;
  totalHargaAwal: number;
  potonganDiskon: number;
  catatan?: string;
  member: { namaMember: string; instansi?: string };
  space: { namaSpace: string; tipe: string; owner: { namaCoworking: string; alamat?: string } };
  diskon?: { namaDiskon: string } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const MAKER_KEY = process.env.NEXT_PUBLIC_MAKER_KEY || 'default-maker';

export default function ETicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ticket, setTicket] = useState<ETicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
          'x-maker-key': MAKER_KEY,
          'Accept': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/reservasi/${id}/e-ticket?format=json`, {
          headers,
        });

        if (!res.ok) throw new Error('Tiket tidak ditemukan atau akses ditolak');

        const json = await res.json();
        setTicket(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, router]);

  const handleDownload = () => {
    // Open printable HTML ticket view
    window.open(`/api/reservasi/${id}/e-ticket`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusStyle = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      belum_dikonfirm: { bg: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', label: 'Menunggu Konfirmasi' },
      disetujui: { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', label: 'Disetujui' },
      aktif: { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', label: 'Aktif' },
      selesai: { bg: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af', label: 'Selesai' },
      dibatalkan: { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', label: 'Dibatalkan' },
    };
    return map[status] ?? { bg: 'rgba(107,114,128,0.2)', color: '#9ca3af', label: status };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--glass-border)', borderTopColor: 'var(--color-accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Memuat e-ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Tiket Tidak Ditemukan</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>{error || 'Data e-ticket tidak tersedia.'}</p>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--gradient-accent)', borderRadius: 'var(--radius-lg)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const statusStyle = getStatusStyle(ticket.status);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Action Bar — hidden on print */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href={`/dashboard/reservasi/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Kembali ke Detail
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-accent)', color: 'white',
              border: 'none', cursor: downloading ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.875rem', opacity: downloading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <Download size={16} />
            {downloading ? 'Mengunduh...' : 'Download PDF'}
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)',
              background: 'var(--glass-bg)', color: 'var(--color-text-primary)',
              border: '1px solid var(--glass-border)', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem', backdropFilter: 'blur(10px)',
              transition: 'background 0.2s',
            }}
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* E-Ticket Card */}
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}>
        {/* Header Strip */}
        <div style={{
          background: 'var(--gradient-accent)',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem' }}>
            Smart Space Booking
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'white' }}>
            E-Ticket Reservasi
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', marginTop: '0.75rem',
            padding: '0.3rem 1rem', borderRadius: '999px',
            background: statusStyle.bg, border: `1px solid ${statusStyle.color}`,
          }}>
            <span style={{ color: statusStyle.color, fontSize: '0.8rem', fontWeight: 600 }}>
              ● {statusStyle.label}
            </span>
          </div>

          {/* Ticket tear notch */}
          <div style={{ position: 'absolute', bottom: -16, left: -16, width: 32, height: 32, borderRadius: '50%', background: 'var(--color-bg)' }} />
          <div style={{ position: 'absolute', bottom: -16, right: -16, width: 32, height: 32, borderRadius: '50%', background: 'var(--color-bg)' }} />
        </div>

        {/* Dashed divider */}
        <div style={{ borderTop: '2px dashed var(--glass-border)', margin: '0 2rem' }} />

        {/* Booking Code */}
        <div style={{ padding: '1.5rem 2rem', textAlign: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>KODE BOOKING</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.15em', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {ticket.kodeBooking}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
              <User size={13} /> PEMESAN
            </div>
            <div style={{ fontWeight: 700 }}>{ticket.member.namaMember}</div>
            {ticket.member.instansi && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{ticket.member.instansi}</div>}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
              <MapPin size={13} /> RUANGAN
            </div>
            <div style={{ fontWeight: 700 }}>{ticket.space.namaSpace}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{ticket.space.owner.namaCoworking}</div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
              <Calendar size={13} /> TANGGAL
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatDate(ticket.tanggalReservasi)}</div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
              <Clock size={13} /> WAKTU
            </div>
            <div style={{ fontWeight: 700 }}>{ticket.jamMulai} – {ticket.jamSelesai}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{ticket.durasiJam} Jam</div>
          </div>
        </div>

        {/* Price Summary */}
        <div style={{ margin: '0 2rem', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            <span>Harga Sewa ({ticket.durasiJam} jam)</span>
            <span>{formatCurrency(ticket.totalHargaAwal)}</span>
          </div>
          {ticket.potonganDiskon > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4ade80', marginBottom: '0.5rem' }}>
              <span>Diskon {ticket.diskon ? `(${ticket.diskon.namaDiskon})` : ''}</span>
              <span>–{formatCurrency(ticket.potonganDiskon)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px dashed var(--glass-border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
            <span>Total Bayar</span>
            <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatCurrency(ticket.totalBayar)}
            </span>
          </div>
        </div>

        {/* Dashed divider */}
        <div style={{ borderTop: '2px dashed var(--glass-border)', margin: '0 2rem' }} />

        {/* QR Code Section */}
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
            <QrCode size={14} /> SCAN UNTUK CHECK-IN
          </div>
          {ticket.qrCode && (
            <div style={{
              display: 'inline-block',
              padding: '1rem',
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 0 0 4px rgba(139,92,246,0.2)',
            }}>
              <img
                src={ticket.qrCode}
                alt="QR Code Check-in"
                style={{ width: 180, height: 180, display: 'block' }}
              />
            </div>
          )}
          <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 300, margin: '1rem auto 0' }}>
            Tunjukkan QR Code ini kepada Admin di lokasi untuk melakukan proses <strong>Check-in</strong>.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
