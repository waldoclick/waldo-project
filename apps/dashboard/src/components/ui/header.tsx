'use client';

import { GlobalSearch } from '@/components/ui/global-search';
import { HeaderIcons } from '@/components/ui/header-icons';
import { UserMenu } from '@/components/ui/user-menu';

export function Header() {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <GlobalSearch />

        <div className="flex items-center gap-4">
          <HeaderIcons />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
