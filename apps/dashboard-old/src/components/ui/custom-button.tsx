import React from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  children: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'primary', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
      primary: {
        enabled:
          'bg-[#ffd699] text-black hover:bg-black hover:text-[#ffd699] focus:ring-[#ffd699]',
        disabled: 'bg-gray-400 text-gray-600 cursor-not-allowed',
      },
      secondary: {
        enabled:
          'bg-black text-[#ffd699] hover:bg-[#ffd699] hover:text-black focus:ring-black',
        disabled: 'bg-gray-400 text-gray-600 cursor-not-allowed',
      },
      ghost: {
        enabled:
          'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300 border-0',
        disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed border-0',
      },
      outline: {
        enabled: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
        disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed',
      },
    };

    const currentVariant = variants[variant];

    const buttonStyles = disabled
      ? currentVariant.disabled
      : currentVariant.enabled;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[3px] border-2 border-[#313338] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 px-4 text-sm h-10 min-h-[40px] max-h-[40px] overflow-hidden',
          baseStyles,
          buttonStyles,
          className
        )}
        disabled={disabled}
        style={
          disabled
            ? {
                cursor: 'not-allowed !important',
                pointerEvents: 'auto',
              }
            : {
                cursor: 'pointer',
              }
        }
        {...props}
      >
        {children}
      </button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export { CustomButton };
