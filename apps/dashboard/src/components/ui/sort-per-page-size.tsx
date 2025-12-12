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
        <Button variant="outline" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          {pageSize} pag. <ChevronDown className="h-4 w-4" />
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
