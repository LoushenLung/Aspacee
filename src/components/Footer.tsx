"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-bg-secondary)',
      borderTop: '1px solid var(--glass-border)',
      padding: 'var(--spacing-12) 0 var(--spacing-6)',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-10)' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-4)' }}>
              Ur<span className="text-gradient">Space</span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7, margin: 0 }}>
              Platform reservasi coworking space dan workstation yang modern dan efisien untuk para profesional.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>Layanan</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {[['Personal Desk', '#spaces'], ['Meeting Room', '#spaces'], ['Private Office', '#spaces']].map(([label, href]) => (
                <Link key={label} href={href} style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', transition: 'color var(--transition-fast)' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>Akun</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {[['Login Member', '/login'], ['Daftar Member', '/register'], ['Admin Space', '/login']].map(([label, href]) => (
                <Link key={label} href={href} style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', transition: 'color var(--transition-fast)' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--spacing-6)', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          © {new Date().getFullYear()} Ur-Space. Smart Coworking Space Booking System.
        </div>
      </div>
    </footer>
  );
}
