import dns from 'dns';
import { prisma } from '@/lib/prisma';
import { SECURITY_POLICIES } from '@/lib/security';

export interface EmailVerificationResult {
  valid: boolean;
  message?: string;
  reason?:
    | 'invalid_format'
    | 'disposable_domain'
    | 'domain_not_found'
    | 'no_mail_server'
    | 'already_registered'
    | 'system_error';
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Allowed demo and test domains that may not have live public DNS records in sandbox
const ALLOWED_TEST_DOMAINS = new Set([
  'urspace.id',
  'urspace.com',
  'example.com',
  'test.com',
  'localhost',
]);

/**
 * Verify whether an email address is syntactically valid and has an active mail server (MX/A DNS records)
 */
export async function verifyEmailDomainAndFormat(email: string): Promise<EmailVerificationResult> {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return {
      valid: false,
      reason: 'invalid_format',
      message: 'Format alamat email tidak valid.',
    };
  }

  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return {
      valid: false,
      reason: 'invalid_format',
      message: 'Format alamat email tidak valid.',
    };
  }

  const domain = parts[1].toLowerCase().trim();

  // Check for disposable temporary email domains
  if (SECURITY_POLICIES.DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return {
      valid: false,
      reason: 'disposable_domain',
      message: 'Penggunaan email sementara (disposable email) tidak diizinkan demi keamanan.',
    };
  }

  // Bypass DNS resolution for allowed local/demo domains
  if (ALLOWED_TEST_DOMAINS.has(domain)) {
    return { valid: true };
  }

  // Real DNS check: verify MX records or A records for the email domain
  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      // Fallback: check if domain has an A record that handles mail
      try {
        const aRecords = await dns.promises.resolve(domain, 'A');
        if (!aRecords || aRecords.length === 0) {
          return {
            valid: false,
            reason: 'no_mail_server',
            message: `Domain email (@${domain}) tidak memiliki server email aktif (MX records).`,
          };
        }
      } catch {
        return {
          valid: false,
          reason: 'domain_not_found',
          message: `Domain email (@${domain}) tidak ditemukan atau tidak aktif.`,
        };
      }
    }
  } catch (error: any) {
    const code = error?.code;
    if (code === 'ENOTFOUND' || code === 'NODATA' || code === 'SERVFAIL') {
      // Try A record fallback
      try {
        const aRecords = await dns.promises.resolve(domain, 'A');
        if (!aRecords || aRecords.length === 0) {
          return {
            valid: false,
            reason: 'domain_not_found',
            message: `Domain email (@${domain}) tidak ditemukan. Pastikan domain email Anda benar.`,
          };
        }
      } catch {
        return {
          valid: false,
          reason: 'domain_not_found',
          message: `Domain email (@${domain}) tidak ditemukan atau tidak aktif. Periksa kembali penulisan email Anda.`,
        };
      }
    }
    // In case of timeout or network glitch, we do not strictly block if resolution fails due to timeout
    if (code === 'ETIMEOUT' || code === 'ECONNREFUSED') {
      console.warn(`[DNS VERIFY WARNING] DNS lookup timed out for domain ${domain}`);
    }
  }

  return { valid: true };
}

/**
 * Full email verification: format, active domain, and uniqueness in database
 */
export async function verifyEmailAvailability(email: string): Promise<EmailVerificationResult> {
  const domainCheck = await verifyEmailDomainAndFormat(email);
  if (!domainCheck.valid) {
    return domainCheck;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findFirst({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    return {
      valid: false,
      reason: 'already_registered',
      message: 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.',
    };
  }

  return { valid: true, message: 'Alamat email valid dan tersedia.' };
}
