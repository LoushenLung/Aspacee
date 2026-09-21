import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, CalendarCheck, LogOut } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || (session.user as any).role !== 'member') {
    redirect('/login');
  }

  const name = (session.user as any)?.name ?? 'Member';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--glass-border)', padding: 'var(--spacing-4) 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Ur<span className="text-gradient">Space</span>
          </Link>

          <div style={{ display: 'flex', gap: 'var(--spacing-6)', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href="/booking" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <CalendarCheck size={16} /> Booking
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{name}</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Member</p>
            </div>
            <form action={async () => { 'use server'; /* handled client-side */ }}>
              <SignOutButton />
            </form>
          </div>
        </div>
      </nav>

      <div style={{ padding: 'var(--spacing-8) 0' }}>
        <div className="container">{children}</div>
      </div>
    </div>
  );
}

function SignOutButton() {
  return (
    <button
      style={{ background: 'none', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2) var(--spacing-3)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}
      formAction={async () => {
        'use server';
        const { signOut } = await import('@/lib/auth');
        await signOut({ redirectTo: '/login' });
      }}
    >
      <LogOut size={14} /> Keluar
    </button>
  );
}
