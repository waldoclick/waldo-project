'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X, FileCheck } from 'lucide-react';
import { getCondition, updateCondition } from '@/lib/strapi/conditions';
import { StrapiCondition } from '@/lib/strapi/types';

export default function EditConditionPage() {
  const params = useParams();
  const router = useRouter();
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

      router.push('/conditions');
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              Editar Condición
            </h1>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Formulario */}
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

              <div className="bg-gray-50 p-3 rounded-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Información Actual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {condition.id}
                  </div>
                  <div>
                    <span className="font-medium">Slug:</span> {condition.slug}
                  </div>
                  <div>
                    <span className="font-medium">Creado:</span>{' '}
                    {new Date(condition.createdAt).toLocaleDateString('es-CL')}
                  </div>
                  <div>
                    <span className="font-medium">Actualizado:</span>{' '}
                    {new Date(condition.updatedAt).toLocaleDateString('es-CL')}
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
