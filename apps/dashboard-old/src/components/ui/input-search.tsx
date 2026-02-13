'use client';

import * as React from 'react';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputSearchProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export function InputSearch({
  value,
  onChange,
  onClear,
  className,
  ...props
}: InputSearchProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div
      className={cn(
        'group relative flex items-center bg-white border border-[#EAEBEB] rounded-[4px] h-[42px] transition-all hover:shadow-[0_0_30px_rgba(49,51,56,0.1)]',
        className
      )}
    >
      <div className="flex items-center justify-center w-[55px] shrink-0">
        <Search className="h-5 w-5 text-[#313338]" />
      </div>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#313338] h-full pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#313338] transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
