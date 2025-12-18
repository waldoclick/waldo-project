'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { JsonViewerButton } from '@/components/ui/json-viewer-button';
import { ArrowLeft, User } from 'lucide-react';
import { getUserUsername } from '@/lib/strapi';

interface UserHeaderProps {
  userId: string;
  showJsonButton?: boolean;
  showBackButton?: boolean;
}

export function UserHeader({
  userId,
  showJsonButton = false,
  showBackButton = true,
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <User className="h-7 w-7" style={{ color: '#313338' }} />
        <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
          {loading ? 'Cargando...' : username || `Usuario ${userId}`}
        </h1>
      </div>
      <div className="flex space-x-2">
        {showBackButton && (
          <Link href="/users">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        )}
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
  );
}
