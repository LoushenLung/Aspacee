import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailAvailability } from '@/lib/email-verifier';
import { checkRateLimit, getClientIp, SECURITY_POLICIES } from '@/lib/security';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`check-email:${ip}`, SECURITY_POLICIES.MAX_EMAIL_CHECKS_PER_MINUTE, 60 * 1000);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        status: false,
        message: 'Terlalu banyak permintaan pengecekan email. Silakan tunggu beberapa saat.',
      },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { status: false, message: 'Parameter email wajib diisi' },
      { status: 400 }
    );
  }

  const result = await verifyEmailAvailability(email);

  return NextResponse.json({
    status: result.valid,
    available: result.valid,
    reason: result.reason,
    message: result.message,
  });
}
