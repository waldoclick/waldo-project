'use client';

import { Button } from '@/components/ui/button';
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
        <Button
          variant="outline"
          className="h-[45px] rounded-[4px] border-[#dcdcdc] bg-white text-[#313338] hover:bg-white hover:shadow-[0_0_15px_rgba(49,51,56,0.1)] flex items-center gap-2 px-4"
        >
          <List className="h-[18px] w-[18px]" />
          {pageSize} pag. <ChevronDown className="h-[18px] w-[18px]" />
        </Button>
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
