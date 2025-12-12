'use client';

import { LucideIcon } from 'lucide-react';
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
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {/* Title */}
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </div>

      {/* Value */}
      <div className="text-4xl font-bold text-gray-800 mb-6">
        {formatValue(value)}
      </div>

      {/* Link */}
      {link && (
        <Link
          href={link.href}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-block"
        >
          {link.text}
        </Link>
      )}

      {/* Icon */}
      <div
        className={`absolute bottom-5 right-5 w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor}`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
  );
}
