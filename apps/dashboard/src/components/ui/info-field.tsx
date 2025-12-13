import { Mail, Phone, Link } from 'lucide-react';

interface InfoFieldProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
  type?: 'email' | 'phone' | 'link';
  href?: string;
}

export function InfoField({
  label,
  value,
  className,
  type,
  href,
}: InfoFieldProps) {
  const displayValue = value ?? '-';

  return (
    <div className={className}>
      <label
        className="text-xs font-bold uppercase"
        style={{ color: '#313338' }}
      >
        {label}
      </label>
      {type === 'email' && typeof value === 'string' ? (
        <p>
          <a
            href={`mailto:${value}`}
            className="inline-flex items-center gap-1 underline"
            style={{ color: 'inherit' }}
          >
            <Mail className="h-4 w-4" />
            {value}
          </a>
        </p>
      ) : type === 'phone' && typeof value === 'string' ? (
        <p>
          <a
            href={`tel:${value}`}
            className="inline-flex items-center gap-1 underline"
            style={{ color: 'inherit' }}
          >
            <Phone className="h-4 w-4" />
            {value}
          </a>
        </p>
      ) : type === 'link' && href ? (
        <p>
          <a
            href={href}
            className="inline-flex items-center gap-1 underline"
            style={{ color: 'inherit' }}
          >
            <Link className="h-4 w-4" />
            {displayValue}
          </a>
        </p>
      ) : (
        <p>{displayValue}</p>
      )}
    </div>
  );
}
