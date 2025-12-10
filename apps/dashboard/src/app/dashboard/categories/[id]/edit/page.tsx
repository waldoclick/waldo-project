'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';
import { getCategory, updateCategory } from '@/lib/strapi/categories';
import { StrapiCategory } from '@/lib/strapi/types';

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
      router.push('/dashboard/categories');
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

      router.push('/dashboard/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/categories');
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Editar Categoría</h1>
            <p className="text-gray-500">
              Modificar información de la categoría
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Formulario */}
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
                  Puedes usar un código de color hexadecimal o seleccionar del
                  color picker
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Información Actual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {category.id}
                  </div>
                  <div>
                    <span className="font-medium">Slug:</span> {category.slug}
                  </div>
                  <div>
                    <span className="font-medium">Creado:</span>{' '}
                    {new Date(category.createdAt).toLocaleDateString('es-CL')}
                  </div>
                  <div>
                    <span className="font-medium">Actualizado:</span>{' '}
                    {new Date(category.updatedAt).toLocaleDateString('es-CL')}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
