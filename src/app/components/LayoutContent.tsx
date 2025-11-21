'use client';

import { usePathname } from 'next/navigation';
import Header from './layout/Header';
import Footer from './layout/Footer';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const isAdminRoute = pathname?.startsWith('/admin/') && !isLoginPage;

  if (isLoginPage || isAdminRoute) {
    // Login page and admin pages - no header/footer (they have their own layout)
    return <>{children}</>;
  }

  // Public pages - with header and footer
  return (
    <main className="grow">
      {children}
    </main>
  );
}