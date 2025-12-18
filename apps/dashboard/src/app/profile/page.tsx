'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Shield, Edit, Lock } from 'lucide-react';
import { useUserStore } from '@/stores/users';
import { InfoField } from '@/components/ui/info-field';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { formatDate } = useFormatDate();

  // Si no hay usuario, mostrar mensaje
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Información de tu cuenta</p>
          </div>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">
                No se pudo cargar la información del perfil
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Información de tu cuenta</p>
          </div>
          <div className="flex gap-2">
            <Button size="header" onClick={() => router.push('/profile/edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="header"
              onClick={() => router.push('/profile/change-password')}
            >
              <Lock className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Nombres" value={user.firstname} />
                  <InfoField label="Apellidos" value={user.lastname} />
                  <InfoField label="Username" value={user.username} />
                  <InfoField label="Email" value={user.email} type="email" />
                  <InfoField label="ID de Usuario" value={user.id} />
                  <InfoField label="Proveedor" value={user.provider} />
                  <InfoField
                    label="Confirmado"
                    value={user.confirmed ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Bloqueado"
                    value={user.blocked ? 'Sí' : 'No'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información de roles */}
            {user.role && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Información de Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Rol" value={user.role.name} />
                    <InfoField
                      label="Descripción"
                      value={user.role.description}
                    />
                    <InfoField label="Tipo" value={user.role.type} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Fechas
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
