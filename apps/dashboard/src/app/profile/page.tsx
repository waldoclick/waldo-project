'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useUserStore } from '@/stores/users';
import { StrapiUser } from '@/lib/strapi';

export default function ProfilePage() {
  const { user } = useUserStore();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (user: StrapiUser) => {
    if (user.blocked) {
      return <Badge variant="destructive">Bloqueado</Badge>;
    }
    if (user.confirmed) {
      return <Badge variant="default">Confirmado</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Información de tu cuenta</p>
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre de Usuario
                    </label>
                    <p className="text-lg font-semibold">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-lg font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID de Usuario
                    </label>
                    <p className="font-mono text-sm">{user.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Proveedor
                    </label>
                    <p>{user.provider}</p>
                  </div>
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
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Rol
                      </label>
                      <p className="font-medium">{user.role.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Descripción
                      </label>
                      <p>{user.role.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Tipo
                      </label>
                      <p>{user.role.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado del usuario */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <div className="mt-1">{getStatusBadge(user)}</div>
                </div>

                <div className="flex items-center space-x-2">
                  {user.confirmed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Confirmado</p>
                    <p className="text-sm text-gray-600">
                      {user.confirmed ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {user.blocked ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">Bloqueado</p>
                    <p className="text-sm text-gray-600">
                      {user.blocked ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Creado
                  </label>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Actualizado
                  </label>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
