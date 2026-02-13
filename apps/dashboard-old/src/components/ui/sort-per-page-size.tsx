'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { List, ChevronDown } from 'lucide-react';

interface SortPerPageSizeProps {
  pageSize: number;
  setPageSize: (size: number) => void;
  sizes?: number[];
}

export function SortPerPageSize({
  pageSize,
  setPageSize,
  sizes = [10, 25, 50, 100],
}: SortPerPageSizeProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-[42px] px-4 bg-white border border-[#EAEBEB] rounded-[4px] text-[14px] text-[#313338] transition-all hover:shadow-[0_0_30px_rgba(49,51,56,0.1)] outline-none">
          <List className="h-4 w-4" />
          {pageSize} pag. <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sizes.map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => setPageSize(size)}
            className={pageSize === size ? 'bg-gray-100' : ''}
          >
            {size} pag.
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
