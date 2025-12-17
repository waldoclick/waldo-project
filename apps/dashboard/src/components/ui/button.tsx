import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        brand:
          'rounded-[3px] border-2 border-[#313338] bg-[#ffd699] text-black shadow-none hover:bg-black hover:text-[#ffd699] focus-visible:ring-[#ffd699] disabled:opacity-100 disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed',
        brandSecondary:
          'rounded-[3px] border-2 border-[#313338] bg-black text-[#ffd699] shadow-none hover:bg-[#ffd699] hover:text-black focus-visible:ring-black disabled:opacity-100 disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed',
        brandGhost:
          'rounded-[3px] border-0 bg-white text-gray-700 shadow-none hover:bg-gray-50 focus-visible:ring-gray-300 disabled:opacity-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
        brandOutline:
          'rounded-[3px] border-2 border-[#313338] bg-white text-gray-700 shadow-none hover:bg-gray-50 focus-visible:ring-gray-300 disabled:opacity-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        header: 'h-[45px] px-4 py-2 has-[>svg]:px-3',
        brand: 'h-10 min-h-[40px] max-h-[40px] overflow-hidden px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
