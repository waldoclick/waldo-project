interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string) {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'WA';

  // Email fallback should match website behavior (first 2 chars)
  if (trimmed.includes('@')) return trimmed.slice(0, 2).toUpperCase();

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  // Single name (e.g. firstname) -> first letter like website
  return trimmed.charAt(0).toUpperCase();
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = getInitials(name);

  // Tamaños del avatar
  const sizeClasses = {
    sm: 'w-[30px] h-[30px] text-[12px]',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full ${className}`}
      style={{
        backgroundColor: '#ffd699',
        border: '2px solid #313338',
      }}
    >
      <span className="text-[#313338] font-semibold tracking-[0.5px] uppercase leading-none">
        {initials}
      </span>
    </div>
  );
}
