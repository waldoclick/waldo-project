'use client';

import { LucideIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  link?: {
    text: string;
    href: string;
  };
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export function StatCard({
  title,
  value,
  link,
  icon: Icon,
  iconColor,
  iconBgColor,
}: StatCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('es-CL').format(val);
    }
    return val;
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-5 relative">
      {/* Title */}
      <div className="text-xs text-gray-500 capitalize tracking-wide mb-3 font-bold">
        {title}
      </div>

      {/* Value */}
      <div className="text-3xl font-normal text-gray-600 mb-6">
        {formatValue(value)}
      </div>

      {/* Link */}
      {link && (
        <Link
          href={link.href}
          className="text-xs underline inline-flex items-center gap-1"
          style={{ color: '#313338' }}
        >
          <ArrowRight className="h-3 w-3" />
          {link.text}
        </Link>
      )}

      {/* Icon */}
      <div
        className={`absolute bottom-5 right-5 w-12 h-12 rounded-sm flex items-center justify-center ${iconBgColor}`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
  );
}
