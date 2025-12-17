'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X, User, Info } from 'lucide-react';
import { updateUser, getCurrentUser, StrapiUser } from '@/lib/strapi';
import { useUserStore } from '@/stores/users';
import { InfoField } from '@/components/ui/info-field';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function EditProfilePage() {
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const { user: userFromStore, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [user, setUserState] = useState<StrapiUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const fetchUser = useCallback(async () => {
    try {
      // Obtener usuario actualizado desde el servidor
      const currentUser = await getCurrentUser();
      setUserState(currentUser);
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Error al cargar el usuario');
      router.push('/profile');
    }
  }, [router]);

  useEffect(() => {
    // Si hay usuario en el store, usarlo inicialmente
    if (userFromStore) {
      setUserState(userFromStore);
      setFormData({
        username: userFromStore.username || '',
        email: userFromStore.email || '',
      });
    }
    // Luego obtener datos actualizados del servidor
    fetchUser();
  }, [fetchUser, userFromStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      alert('El nombre de usuario es obligatorio');
      return;
    }

    if (!formData.email.trim()) {
      alert('El email es obligatorio');
      return;
    }

    if (!user) {
      alert('No se pudo cargar la información del usuario');
      return;
    }

    try {
      setLoading(true);
      const response = await updateUser(user.id, {
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      // Actualizar el store con el usuario actualizado
      // La respuesta puede venir como { data: StrapiUser } o directamente como StrapiUser
      const updatedUserData = response.data || response;
      setUser(updatedUserData);

      router.push('/profile');
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al actualizar el usuario';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Waldo', href: '/' },
              { label: 'Perfil', href: '/profile' },
              { label: 'Editar Perfil' },
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
                Editar Perfil
              </h1>
            </div>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nombre de Usuario *
                    </label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Ingresa el nombre de usuario"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Ingresa el email"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Información Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField label="ID" value={user.id} />
                <InfoField label="Proveedor" value={user.provider} />
                <InfoField
                  label="Confirmado"
                  value={user.confirmed ? 'Sí' : 'No'}
                />
                <InfoField
                  label="Bloqueado"
                  value={user.blocked ? 'Sí' : 'No'}
                />
                {user.role && <InfoField label="Rol" value={user.role.name} />}
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
