"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Navbar({ session }: { session?: any }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    ['/', 'Beranda'],
    ['/#spaces', 'Space'],
    ['/#promo', 'Promo']
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(10, 10, 15, 0.85)' : 'transparent', 
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
      transition: 'all var(--transition-normal)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4) var(--spacing-6)' }}>
        <Link href="/" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Ur<span className="text-gradient">Space</span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'none', gap: 'var(--spacing-8)', alignItems: 'center' }} className="md-flex">
          <div style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
            {navLinks.map(([href, label]) => (
              <Link key={href} href={href} style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', transition: 'color var(--transition-fast)' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >{label}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
            {session ? (
              <>
                <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2) var(--spacing-4)', textDecoration: 'none', gap: 'var(--spacing-2)' }}>
                  <User size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="btn" style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2) var(--spacing-4)', background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid transparent' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-error)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  <LogOut size={16} /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary" style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2) var(--spacing-5)', textDecoration: 'none' }}>Masuk</Link>
                <Link href="/register" className="btn btn-primary" style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-2) var(--spacing-5)', textDecoration: 'none' }}>Daftar</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md-hidden" 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 'var(--spacing-1)' }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md-hidden glass-panel animate-fade-in" style={{ 
          position: 'absolute', top: '100%', left: 'var(--spacing-4)', right: 'var(--spacing-4)', 
          padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {navLinks.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ padding: 'var(--spacing-2)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >{label}</Link>
            ))}
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'center', gap: 'var(--spacing-2)' }}>
                  <User size={18} /> Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn" style={{ justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <LogOut size={18} /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-secondary" style={{ justifyContent: 'center' }}>Masuk</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>Daftar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
