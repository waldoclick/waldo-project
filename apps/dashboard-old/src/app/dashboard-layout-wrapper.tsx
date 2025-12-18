'use client';

import { usePathname } from 'next/navigation';
import DashboardLayout from './dashboard-layout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute =
    pathname?.startsWith('/login') || pathname?.startsWith('/auth');

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
