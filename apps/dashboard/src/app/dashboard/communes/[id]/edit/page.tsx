'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';
import {
  getCommune,
  updateCommune,
  getRegions,
  StrapiCommune,
  StrapiRegion,
} from '@/lib/strapi';

export default function EditCommunePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [commune, setCommune] = useState<StrapiCommune | null>(null);
  const [regions, setRegions] = useState<StrapiRegion[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
  });

  const communeId = params.id as string;

  const fetchCommune = useCallback(async () => {
    try {
      const response = await getCommune(parseInt(communeId));
      setCommune(response.data);
      setFormData({
        name: response.data.name,
        region: response.data.region?.id.toString() || '',
      });
    } catch (error) {
      console.error('Error fetching commune:', error);
      alert('Error al cargar la comuna');
      router.push('/dashboard/communes');
    }
  }, [communeId, router]);

  const fetchRegions = useCallback(async () => {
    try {
      const response = await getRegions({
        page: 1,
        pageSize: 100,
        sort: 'name:asc',
      });
      setRegions(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  }, []);

  useEffect(() => {
    fetchCommune();
    fetchRegions();
  }, [fetchCommune, fetchRegions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!formData.region) {
      alert('Debe seleccionar una región');
      return;
    }

    try {
      setLoading(true);
      await updateCommune(parseInt(communeId), {
        name: formData.name.trim(),
        region: parseInt(formData.region),
      });

      router.push('/dashboard/communes');
    } catch (error) {
      console.error('Error updating commune:', error);
      alert('Error al actualizar la comuna');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/communes');
  };

  if (!commune) {
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Comuna</h1>
            <p className="text-gray-600">Modificar información de la comuna</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Comuna</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre de la Comuna *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Santiago"
                  required
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  El slug se actualizará automáticamente basado en el nombre
                </p>
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Región *
                </label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar región</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Información Actual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {commune.id}
                  </div>
                  <div>
                    <span className="font-medium">Slug:</span> {commune.slug}
                  </div>
                  <div>
                    <span className="font-medium">Región:</span>{' '}
                    {commune.region?.name || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Creado:</span>{' '}
                    {new Date(commune.createdAt).toLocaleDateString('es-CL')}
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
