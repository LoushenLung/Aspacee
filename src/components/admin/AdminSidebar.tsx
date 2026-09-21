"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, CalendarCheck, Users, Building2,
  Tag, FileBarChart2, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/reservasi', icon: CalendarCheck, label: 'Reservasi' },
  { href: '/admin/spaces', icon: Building2, label: 'Kelola Space' },
  { href: '/admin/members', icon: Users, label: 'Data Member' },
  { href: '/admin/diskon', icon: Tag, label: 'Promo & Diskon' },
  { href: '/admin/laporan', icon: FileBarChart2, label: 'Laporan' },
  { href: '/admin/profile', icon: Settings, label: 'Profil Space' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? '70px' : '240px',
      minHeight: '100vh',
      background: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width var(--transition-normal)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: 'var(--spacing-6)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--glass-border)' }}>
        {!collapsed && (
          <Link href="/admin" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Ur<span className="text-gradient">Space</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 'var(--spacing-1)' }}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: 'var(--spacing-4) var(--spacing-2)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
              padding: 'var(--spacing-3) var(--spacing-3)',
              borderRadius: 'var(--radius-md)',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
              fontSize: 'var(--font-size-sm)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderLeft: isActive ? '3px solid var(--color-accent-primary)' : '3px solid transparent',
            }}
            title={collapsed ? label : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: 'var(--spacing-4) var(--spacing-2)', borderTop: '1px solid var(--glass-border)' }}>
        <button onClick={() => signOut({ callbackUrl: '/login' })} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
          padding: 'var(--spacing-3) var(--spacing-3)',
          borderRadius: 'var(--radius-md)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#ef4444', fontSize: 'var(--font-size-sm)',
          width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'background var(--transition-fast)',
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && 'Keluar'}
        </button>
      </div>
    </aside>
  );
}
