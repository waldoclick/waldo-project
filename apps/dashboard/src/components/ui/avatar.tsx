interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  // Obtener inicial del nombre
  const initial = name.charAt(0).toUpperCase();

  // Tamaños del avatar
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
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
      <span className="text-gray-700 font-medium">{initial}</span>
    </div>
  );
}
