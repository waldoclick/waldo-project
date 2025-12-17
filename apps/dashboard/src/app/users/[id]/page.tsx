'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonViewerButton } from '@/components/ui/json-viewer-button';
import { ArrowLeft, User, Info } from 'lucide-react';
import { getUser, StrapiUser } from '@/lib/strapi';
import { useFormatDate } from '@/hooks/useFormatDate';
import { InfoField } from '@/components/ui/info-field';
import { Tabs } from '@/components/ui/tabs';
import { UserTabs } from './_components/user-tabs';
import Link from 'next/link';

// Interfaz extendida para el usuario con campos adicionales
interface ExtendedStrapiUser extends StrapiUser {
  firstname?: string;
  lastname?: string;
  rut?: string;
  phone?: string;
  birthdate?: string;
  pro?: boolean;
  is_company?: boolean;
  address?: string;
  address_number?: number;
  postal_code?: string;
  last_username_change?: string;
  business_name?: string;
  business_type?: string;
  business_rut?: string;
  business_address?: string;
  business_address_number?: number;
  business_postal_code?: string;
  commune?: {
    id: number;
    name: string;
    region?: {
      id: number;
      name: string;
    };
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { formatDate } = useFormatDate();
  const [user, setUser] = useState<ExtendedStrapiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUser(parseInt(userId));

      console.log('User detail response:', response);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const getStatusBadge = (user: ExtendedStrapiUser) => {
    if (user.blocked) {
      return <Badge variant="destructive">Bloqueado</Badge>;
    }
    if (user.confirmed) {
      return <Badge variant="default">Confirmado</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Usuario no encontrado'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Waldo', href: '/' },
              { label: 'Usuarios', href: '/users' },
              { label: user.username },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                {user.username}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Link href="/users">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <JsonViewerButton
                data={user}
                title={`JSON del Usuario: ${user.username}`}
                buttonText="Ver JSON"
                buttonVariant="outline"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value="information" className="w-full">
          <UserTabs userId={userId} />
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Nombre de Usuario" value={user.username} />
                  <InfoField label="Email" value={user.email} type="email" />
                  <InfoField label="Nombre" value={user.firstname} />
                  <InfoField label="Apellido" value={user.lastname} />
                  <InfoField label="RUT" value={user.rut} />
                  <InfoField label="Teléfono" value={user.phone} type="phone" />
                  <InfoField
                    label="Fecha de Nacimiento"
                    value={user.birthdate ? formatDate(user.birthdate) : null}
                  />
                  <InfoField
                    label="Usuario PRO"
                    value={user.pro ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Dirección"
                    value={
                      user.address && user.address_number && user.commune?.name
                        ? `${user.address} ${user.address_number}, ${user.commune.name}`
                        : user.address && user.commune?.name
                          ? `${user.address}, ${user.commune.name}`
                          : `${user.address || ''}${user.address && user.address_number ? ' ' : ''}${user.address_number || ''}${(user.address || user.address_number) && user.commune?.name ? ', ' : ''}${user.commune?.name || ''}` ||
                            null
                    }
                  />
                  <InfoField label="Código Postal" value={user.postal_code} />
                  <InfoField label="Comuna" value={user.commune?.name} />
                  <InfoField
                    label="Región"
                    value={user.commune?.region?.name}
                  />
                  <InfoField label="Proveedor" value={user.provider} />
                  <InfoField label="ID" value={user.id} />
                  <InfoField
                    label="Último cambio de usuario"
                    value={
                      user.last_username_change
                        ? formatDate(user.last_username_change)
                        : null
                    }
                  />
                  <div>
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: '#313338' }}
                    >
                      Estado
                    </label>
                    <div className="mt-1">{getStatusBadge(user)}</div>
                  </div>
                  <InfoField
                    label="Confirmado"
                    value={user.confirmed ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Bloqueado"
                    value={user.blocked ? 'Sí' : 'No'}
                  />
                  {user.is_company && (
                    <>
                      <InfoField
                        label="Nombre de la Empresa"
                        value={user.business_name}
                      />
                      <InfoField
                        label="RUT de la Empresa"
                        value={user.business_rut}
                      />
                      <InfoField
                        label="Tipo de Empresa"
                        value={user.business_type}
                      />
                      <InfoField
                        label="Dirección de la Empresa"
                        value={
                          user.business_address && user.business_address_number
                            ? `${user.business_address} ${user.business_address_number}`
                            : user.business_address || null
                        }
                      />
                      <InfoField
                        label="Código Postal de la Empresa"
                        value={user.business_postal_code}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Detalles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField label="Creado" value={formatDate(user.createdAt)} />
                <InfoField
                  label="Actualizado"
                  value={formatDate(user.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
