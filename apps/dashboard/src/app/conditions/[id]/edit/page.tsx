'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X, FileCheck, Info } from 'lucide-react';
import { getCondition, updateCondition } from '@/lib/strapi/conditions';
import { StrapiCondition } from '@/lib/strapi/types';
import { InfoField } from '@/components/ui/info-field';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function EditConditionPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState<StrapiCondition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const conditionId = params.id as string;

  const fetchCondition = useCallback(async () => {
    try {
      const response = await getCondition(parseInt(conditionId));
      setCondition(response.data);
      setFormData({
        name: response.data.name,
      });
    } catch (error) {
      console.error('Error fetching condition:', error);
      alert('Error al cargar la condición');
      router.push('/conditions');
    }
  }, [conditionId, router]);

  useEffect(() => {
    fetchCondition();
  }, [fetchCondition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await updateCondition(parseInt(conditionId), {
        name: formData.name.trim(),
      });

      router.push(`/conditions/${conditionId}`);
    } catch (error) {
      console.error('Error updating condition:', error);
      alert('Error al actualizar la condición');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/conditions');
  };

  if (!condition) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando condición...</p>
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
              { label: 'Condiciones', href: '/conditions' },
              {
                label: condition?.name ?? 'Editar Condición',
                href: `/conditions/${conditionId}`,
              },
              { label: 'Editar' },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Editar Condición
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
                <CardTitle>Información de la Condición</CardTitle>
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
                      placeholder="Ingresa el nombre de la condición"
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
                <InfoField label="ID" value={condition.id} />
                <InfoField label="Slug" value={condition.slug} />
                <InfoField
                  label="Creado"
                  value={formatDate(condition.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(condition.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
