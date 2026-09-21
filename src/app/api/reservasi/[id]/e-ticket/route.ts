import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'qrcode';

// GET /api/reservasi/[id]/e-ticket
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 401 });
    }

    const { id } = await params;

    const reservasi = await prisma.reservasi.findUnique({
      where: { id },
      include: {
        member: { select: { namaMember: true, telp: true, instansi: true } },
        space: {
          select: { namaSpace: true, tipe: true, kapasitas: true },
          include: { owner: { select: { namaCoworking: true, alamat: true, telp: true } } },
        },
        diskon: { select: { namaDiskon: true, persentaseDiskon: true } },
      },
    });

    if (!reservasi) {
      return NextResponse.json({ status: false, message: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    // Access control: member can only see their own, admin can see all
    const memberId = (session.user as any).memberId;
    const role = (session.user as any).role;
    if (role === 'member' && reservasi.memberId !== memberId) {
      return NextResponse.json({ status: false, message: 'Akses ditolak' }, { status: 403 });
    }

    // Generate QR Code
    const qrData = JSON.stringify({
      kodeBooking: reservasi.kodeBooking,
      reservasiId: reservasi.id,
      member: reservasi.member.namaMember,
      space: reservasi.space.namaSpace,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 1 });

    const acceptHeader = req.headers.get('accept') || '';
    const format = req.nextUrl.searchParams.get('format');
    if (format === 'json' || acceptHeader.includes('application/json')) {
      return NextResponse.json({
        status: true,
        data: {
          ...reservasi,
          qrToken: reservasi.qrToken,
          qrCode: qrCodeDataUrl,
        },
      });
    }

    const typeMap: Record<string, string> = { desk: 'Personal Desk', meeting_room: 'Meeting Room', private_office: 'Private Office' };
    const statusMap: Record<string, string> = { belum_dikonfirm: 'Menunggu Konfirmasi', disetujui: 'Disetujui', aktif: 'Sedang Digunakan', selesai: 'Selesai', dibatalkan: 'Dibatalkan' };

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>E-Ticket Reservasi - ${reservasi.kodeBooking}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; padding: 40px 20px; }
    .ticket { max-width: 620px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 32px; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
    .header p { opacity: 0.85; font-size: 14px; }
    .badge { display: inline-block; margin-top: 12px; padding: 4px 16px; border-radius: 99px; background: rgba(255,255,255,0.2); font-size: 12px; font-weight: 600; }
    .body { padding: 32px; }
    .kode { text-align: center; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 2px dashed #e5e7eb; }
    .kode .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .kode .code { font-family: 'Courier New', monospace; font-size: 26px; font-weight: 800; color: #6366f1; letter-spacing: 3px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .item .label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .item .value { font-size: 14px; font-weight: 600; color: #111827; }
    .divider { border-top: 1px solid #f3f4f6; margin: 20px 0; }
    .total { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f9fafb; border-radius: 12px; margin-bottom: 24px; }
    .total .label { font-size: 14px; color: #6b7280; }
    .total .value { font-size: 22px; font-weight: 800; color: #111827; }
    .qr { text-align: center; }
    .qr img { width: 140px; height: 140px; }
    .qr .hint { font-size: 11px; color: #9ca3af; margin-top: 8px; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    @media print { body { background: white; padding: 0; } .ticket { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <h1>Ur-Space</h1>
      <p>Smart Coworking Space Booking</p>
      <div class="badge">${reservasi.space.owner.namaCoworking}</div>
    </div>
    <div class="body">
      <div class="kode">
        <div class="label">Kode Reservasi</div>
        <div class="code">${reservasi.kodeBooking}</div>
        <div style="margin-top:8px; font-size:12px; color:${reservasi.status === 'disetujui' ? '#6366f1' : reservasi.status === 'aktif' ? '#10b981' : '#9ca3af'}; font-weight:600">
          ${statusMap[reservasi.status] ?? reservasi.status}
        </div>
      </div>

      <div class="grid">
        <div class="item"><div class="label">Nama Member</div><div class="value">${reservasi.member.namaMember}</div></div>
        <div class="item"><div class="label">Instansi</div><div class="value">${reservasi.member.instansi ?? '-'}</div></div>
        <div class="item"><div class="label">Space</div><div class="value">${reservasi.space.namaSpace}</div></div>
        <div class="item"><div class="label">Tipe Space</div><div class="value">${typeMap[reservasi.space.tipe] ?? reservasi.space.tipe}</div></div>
        <div class="item"><div class="label">Tanggal</div><div class="value">${new Date(reservasi.tanggalReservasi).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        <div class="item"><div class="label">Jam</div><div class="value">${reservasi.jamMulai} – ${reservasi.jamSelesai} (${reservasi.durasiJam} jam)</div></div>
        <div class="item"><div class="label">Kapasitas</div><div class="value">${reservasi.space.kapasitas} orang</div></div>
        <div class="item"><div class="label">Harga/Jam</div><div class="value">${formatCurrency(Number(reservasi.hargaPerJam))}</div></div>
      </div>

      ${reservasi.diskon ? `
      <div class="divider"></div>
      <div class="grid">
        <div class="item"><div class="label">Promo</div><div class="value">${reservasi.diskon.namaDiskon}</div></div>
        <div class="item"><div class="label">Potongan</div><div class="value" style="color:#10b981">-${formatCurrency(Number(reservasi.potonganDiskon))}</div></div>
      </div>` : ''}

      <div class="total">
        <div class="label">Total Pembayaran</div>
        <div class="value">${formatCurrency(Number(reservasi.totalBayar))}</div>
      </div>

      <div class="qr">
        <img src="${qrCodeDataUrl}" alt="QR Code Check-In" />
        <div class="hint">Tunjukkan QR Code ini saat check-in di lokasi</div>
      </div>
    </div>
    <div class="footer">
      ${reservasi.space.owner.namaCoworking} · ${reservasi.space.owner.alamat ?? ''} · ${reservasi.space.owner.telp ?? ''}<br/>
      Dicetak pada ${new Date().toLocaleString('id-ID')} · Ur-Space Smart Booking System
    </div>
  </div>
  <div style="text-align:center;margin-top:16px">
    <button onclick="window.print()" style="padding:10px 24px;background:#6366f1;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">🖨️ Cetak / Save PDF</button>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('[E-TICKET ERROR]', error);
    return NextResponse.json({ status: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
