'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortByDataProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  options: SortOption[];
}

export function SortByData({ sortBy, setSortBy, options }: SortByDataProps) {
  const currentOption = options.find((opt) => opt.value === sortBy);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-[42px] px-4 bg-white border border-[#EAEBEB] rounded-[4px] text-[14px] text-[#313338] transition-all hover:shadow-[0_0_30px_rgba(49,51,56,0.1)] outline-none">
          <ArrowUpDown className="h-4 w-4" />
          {currentOption?.label || sortBy}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={sortBy === option.value ? 'bg-gray-100' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
