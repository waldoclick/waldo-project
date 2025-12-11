'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    <div className={cn('relative', className)}>
      <Input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
