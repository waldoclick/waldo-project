'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoField } from '@/components/ui/info-field';
import { ArrowLeft, Save, X, Info, Tag } from 'lucide-react';
import { getCategory, updateCategory } from '@/lib/strapi/categories';
import { StrapiCategory } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<StrapiCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
  });

  const categoryId = params.id as string;
  const { formatDate } = useFormatDate();

  const fetchCategory = useCallback(async () => {
    try {
      const response = await getCategory(parseInt(categoryId));
      setCategory(response.data);
      setFormData({
        name: response.data.name,
        color: response.data.color || '',
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Error al cargar la categoría');
      router.push('/categories');
    }
  }, [categoryId, router]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await updateCategory(parseInt(categoryId), {
        name: formData.name.trim(),
        color: formData.color.trim() || undefined,
      });

      router.push(`/categories/${categoryId}`);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando categoría...</p>
        </div>
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
              { label: 'Categorías', href: '/categories' },
              {
                label: category?.name ?? 'Editar Categoría',
                href: `/categories/${categoryId}`,
              },
              { label: 'Editar' },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Editar Categoría
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
                <CardTitle>Información de la Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nombre *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ingresa el nombre de la categoría"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="color"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Color (opcional)
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        className="w-20 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Puedes usar un código de color hexadecimal o seleccionar
                      del color picker
                    </p>
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Información Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField label="ID" value={category.id} />
                <InfoField label="Slug" value={category.slug} />
                <InfoField
                  label="Creado"
                  value={formatDate(category.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(category.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
