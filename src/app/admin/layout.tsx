import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || (session.user as any).role !== 'admin_space') {
    redirect('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          padding: 'var(--spacing-4) var(--spacing-6)',
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-4)',
        }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
              {(session.user as any)?.name ?? 'Admin'}
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Admin Pengelola Space</p>
          </div>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'var(--font-weight-bold)', color: 'white', fontSize: 'var(--font-size-sm)',
          }}>
            {((session.user as any)?.name ?? 'A')[0].toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: 'var(--spacing-6)', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
