import React from 'react';
import { cn } from '@/lib/utils';

interface CustomTagProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'info'
    | 'neutral';
  children: React.ReactNode;
  className?: string;
}

const CustomTag = React.forwardRef<HTMLSpanElement, CustomTagProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full transition-colors h-6 min-h-[24px] max-h-[24px] overflow-hidden';

    const variants = {
      primary: 'bg-[#ffd699] text-black',
      secondary: 'bg-black text-[#ffd699]',
      success: 'bg-[#ffd699] text-black',
      warning: 'bg-gray-800 text-white',
      info: 'bg-gray-400 text-gray-800',
      neutral: 'bg-gray-200 text-gray-800',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], 'px-3 text-xs', className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

CustomTag.displayName = 'CustomTag';

export { CustomTag };
