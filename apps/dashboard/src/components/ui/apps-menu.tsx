'use client';

import { useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServices } from '@/hooks/useServices';

export function AppsMenu() {
  const [open, setOpen] = useState(false);
  const services = useServices();

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
        <div className="grid grid-cols-4 gap-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <a
                key={service.name}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 p-3 rounded-sm transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-sm flex items-center justify-center">
                  <Icon className="h-8 w-8 text-gray-700" />
                </div>
                <span className="text-[10px] text-center text-gray-700">
                  {service.name}
                </span>
              </a>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
