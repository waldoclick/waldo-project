'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoField } from '@/components/ui/info-field';
import { ArrowLeft, Save, X, MapPin, Info } from 'lucide-react';
import { getRegion, updateRegion, StrapiRegion } from '@/lib/strapi';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function EditRegionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<StrapiRegion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const regionId = params.id as string;
  const { formatDate } = useFormatDate();

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

      router.push(`/regions/${regionId}`);
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
        <Breadcrumbs
          items={[
            { label: 'Waldo', href: '/' },
            { label: 'Regiones', href: '/regions' },
            {
              label: region?.name ?? 'Editar Región',
              href: `/regions/${regionId}`,
            },
            { label: 'Editar' },
          ]}
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              Editar Región
            </h1>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
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
                <InfoField label="ID" value={region.id} />
                <InfoField label="Slug" value={region.slug} />
                <InfoField
                  label="Comunas"
                  value={region.communes?.length || 0}
                />
                <InfoField
                  label="Creado"
                  value={formatDate(region.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(region.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
