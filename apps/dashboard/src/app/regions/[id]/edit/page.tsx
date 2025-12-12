'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';
import { getRegion, updateRegion, StrapiRegion } from '@/lib/strapi';

export default function EditRegionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<StrapiRegion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const regionId = params.id as string;

  const fetchRegion = useCallback(async () => {
    try {
      const response = await getRegion(parseInt(regionId));
      setRegion(response.data);
      setFormData({
        name: response.data.name,
      });
    } catch (error) {
      console.error('Error fetching region:', error);
      alert('Error al cargar la región');
      router.push('/regions');
    }
  }, [regionId, router]);

  useEffect(() => {
    fetchRegion();
  }, [fetchRegion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await updateRegion(parseInt(regionId), {
        name: formData.name.trim(),
      });

      router.push('/regions');
    } catch (error) {
      console.error('Error updating region:', error);
      alert('Error al actualizar la región');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/regions');
  };

  if (!region) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Región</h1>
            <p className="text-gray-600">Modificar información de la región</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Región</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre de la Región *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Región Metropolitana"
                  required
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  El slug se actualizará automáticamente basado en el nombre
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Información Actual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {region.id}
                  </div>
                  <div>
                    <span className="font-medium">Slug:</span> {region.slug}
                  </div>
                  <div>
                    <span className="font-medium">Comunas:</span>{' '}
                    {region.communes?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Creado:</span>{' '}
                    {new Date(region.createdAt).toLocaleDateString('es-CL')}
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
