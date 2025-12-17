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
        'flex items-center bg-white border border-[#dcdcdc] rounded-[4px] h-[45px] transition hover:shadow-[0_0_15px_rgba(49,51,56,0.1)]',
        className
      )}
    >
      <div className="w-[55px] flex items-center justify-center">
        <Search className="h-[18px] w-[18px] text-[#313338]" />
      </div>

      <div className="flex-1">
        <input
          {...props}
          type={props.type ?? 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-0 outline-none bg-transparent text-[14px] tracking-[0.25px] text-[#313338] px-[6px] py-[6px] placeholder:text-[#9ca3af]"
        />
      </div>

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="w-10 h-full flex items-center justify-center text-[#9ca3af] hover:text-[#313338] transition"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
}
