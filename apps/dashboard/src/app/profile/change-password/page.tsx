'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, Lock, Info, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '@/lib/strapi';
import { useUserStore } from '@/stores/users';
import Swal from 'sweetalert2';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
    };

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La nueva contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.passwordConfirmation.trim()) {
      newErrors.passwordConfirmation =
        'La confirmación de contraseña es obligatoria';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert('No se pudo cargar la información del usuario');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Tu contraseña se ha cambiado con éxito.',
        confirmButtonText: 'Aceptar',
      });
      router.push('/profile');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al cambiar la contraseña';

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Aceptar',
      });
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
        <Breadcrumbs
          items={[
            { label: 'Perfil', href: '/profile' },
            { label: 'Cambiar Contraseña' },
          ]}
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              Cambiar Contraseña
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Contraseña Actual *
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                          });
                          if (errors.currentPassword) {
                            setErrors({ ...errors, currentPassword: '' });
                          }
                        }}
                        required
                        className={`w-full pr-10 ${
                          errors.currentPassword ? 'border-red-500' : ''
                        }`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nueva Contraseña *
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            });
                            if (errors.password) {
                              setErrors({ ...errors, password: '' });
                            }
                          }}
                          required
                          className={`w-full pr-10 ${
                            errors.password ? 'border-red-500' : ''
                          }`}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        La contraseña debe tener al menos 6 caracteres
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="passwordConfirmation"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Confirmar Nueva Contraseña *
                      </label>
                      <div className="relative">
                        <Input
                          id="passwordConfirmation"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.passwordConfirmation}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              passwordConfirmation: e.target.value,
                            });
                            if (errors.passwordConfirmation) {
                              setErrors({
                                ...errors,
                                passwordConfirmation: '',
                              });
                            }
                          }}
                          required
                          className={`w-full pr-10 ${
                            errors.passwordConfirmation ? 'border-red-500' : ''
                          }`}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.passwordConfirmation && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.passwordConfirmation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" size="header" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </Button>
                    <Button
                      type="button"
                      size="header"
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
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    Para mantener tu cuenta segura, asegúrate de elegir una
                    contraseña fuerte que:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Tenga al menos 6 caracteres</li>
                    <li>Sea única y no la uses en otros servicios</li>
                    <li>Combine letras, números y caracteres especiales</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
