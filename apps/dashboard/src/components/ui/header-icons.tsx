'use client';

import { ShoppingBag, Maximize2, Bell } from 'lucide-react';
import { AppsMenu } from './apps-menu';

export function HeaderIcons() {
  return (
    <div className="flex items-center gap-3">
      <AppsMenu />
      <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors">
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute top-0.5 right-0.5 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
          5
        </span>
      </button>
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors">
        <Maximize2 className="h-5 w-5" />
      </button>
      <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-0.5 right-0.5 bg-orange-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
          3
        </span>
      </button>
    </div>
  );
}
