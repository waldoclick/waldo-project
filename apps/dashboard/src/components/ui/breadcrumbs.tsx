import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items = [], className }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ label: 'Waldo', href: '/' }, ...items];

  return (
    <nav aria-label="breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center">
        {allItems.map((item, idx) => {
          const isLast = idx === allItems.length - 1;
          const isLink = !!item.href && !isLast;

          return (
            <li
              key={`${idx}-${String(item.label)}`}
              className="flex items-center"
            >
              {isLink ? (
                <Link
                  href={item.href!}
                  className="underline decoration-1 text-[#313338] hover:opacity-70 transition-opacity"
                >
                  {String(item.label)}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? 'text-[#313338]' : 'text-gray-600')}
                >
                  {String(item.label)}
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
