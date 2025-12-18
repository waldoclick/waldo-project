'use client';

import { useState, useEffect, useCallback } from 'react';
import { JsonViewerButton } from '@/components/ui/json-viewer-button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { User } from 'lucide-react';
import { getUserUsername } from '@/lib/strapi';

interface UserHeaderProps {
  userId: string;
  showJsonButton?: boolean;
}

export function UserHeader({
  userId,
  showJsonButton = false,
}: UserHeaderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsername = useCallback(async () => {
    try {
      setLoading(true);
      const username = await getUserUsername(parseInt(userId));
      setUsername(username);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsername();
  }, [fetchUsername]);

  return (
    <div className="pt-4 pb-4 space-y-2">
      <Breadcrumbs
        items={[
          { label: 'Usuarios', href: '/users' },
          { label: loading ? 'Cargando...' : username || `Usuario ${userId}` },
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-7 w-7" style={{ color: '#313338' }} />
          <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
            {loading ? 'Cargando...' : username || `Usuario ${userId}`}
          </h1>
        </div>
        <div className="flex space-x-2">
          {showJsonButton && username && (
            <JsonViewerButton
              data={{ id: userId, username }}
              title={`JSON del Usuario: ${username}`}
              buttonText="Ver JSON"
              buttonVariant="outline"
            />
          )}
        </div>
      </div>
    </div>
  );
}
