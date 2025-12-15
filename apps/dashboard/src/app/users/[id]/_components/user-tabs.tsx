'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TabsList } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface UserTabsProps {
  userId: string;
}

export function UserTabs({ userId }: UserTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { value: 'information', label: 'Información', href: `/users/${userId}` },
    { value: 'ads', label: 'Anuncios', href: `/users/${userId}/ads` },
    {
      value: 'reservations',
      label: 'Reservas',
      href: `/users/${userId}/reservations`,
    },
    {
      value: 'featured',
      label: 'Destacados',
      href: `/users/${userId}/featured`,
    },
  ];

  const getActiveTab = () => {
    if (pathname?.includes('/featured')) return 'featured';
    if (pathname?.includes('/reservations')) return 'reservations';
    if (pathname?.includes('/ads')) return 'ads';
    return 'information';
  };

  const activeTab = getActiveTab();

  return (
    <div className="inline-flex p-2 bg-gray-100 rounded-md">
      <TabsList className="bg-transparent">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.href}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-5 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </TabsList>
    </div>
  );
}
