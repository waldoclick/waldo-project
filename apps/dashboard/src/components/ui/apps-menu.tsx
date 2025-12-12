'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Grid3x3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SiGoogletagmanager,
  SiGoogleanalytics,
  SiGooglesearchconsole,
  SiRocket,
  SiZoho,
} from 'react-icons/si';

interface App {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

export function AppsMenu() {
  const [open, setOpen] = useState(false);
  const apps: App[] = [
    {
      name: 'Waldo.click',
      icon: Globe,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://waldo.click',
    },
    {
      name: 'GTM',
      icon: SiGoogletagmanager,
      url: 'https://tagmanager.google.com',
    },
    {
      name: 'Analytics',
      icon: SiGoogleanalytics,
      url: 'https://analytics.google.com',
    },
    {
      name: 'Search Console',
      icon: SiGooglesearchconsole,
      url: 'https://search.google.com/search-console',
    },
    {
      name: 'LogRocket',
      icon: SiRocket,
      url: 'https://logrocket.com',
    },
    {
      name: 'Zoho CRM',
      icon: SiZoho,
      url: 'https://crm.zoho.com',
    },
  ];

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors">
          <Grid3x3 className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Servicios</h3>
        </div>
        <div className="border-b border-dashed border-gray-200 -mx-4 mb-4"></div>
        <div className="grid grid-cols-3 gap-3">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 p-3 rounded-sm transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-sm flex items-center justify-center">
                  <Icon className="h-8 w-8 text-gray-700" />
                </div>
                <span className="text-[10px] text-center text-gray-700">
                  {app.name}
                </span>
              </a>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
