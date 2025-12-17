import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isLink = !!item.href && !isLast;

          return (
            <li key={`${idx}-${item.label}`} className="flex items-center">
              {isLink ? (
                <Link
                  href={item.href!}
                  className="underline underline-offset-4 text-[#313338] hover:opacity-70 transition-opacity"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? 'text-[#313338]' : 'text-gray-600')}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  aria-hidden="true"
                  className="mx-2 h-4 w-4 text-gray-400"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
