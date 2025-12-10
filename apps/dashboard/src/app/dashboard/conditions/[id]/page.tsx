'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Calendar, Hash, Package } from 'lucide-react';
import { getCondition } from '@/lib/strapi/conditions';
import { StrapiCondition } from '@/lib/strapi/types';

export default function ConditionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [condition, setCondition] = useState<StrapiCondition | null>(null);
  const [loading, setLoading] = useState(true);

  const conditionId = params.id as string;

  const fetchCondition = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCondition(parseInt(conditionId));
      setCondition(response.data);
    } catch (error) {
      console.error('Error fetching condition:', error);
      alert('Error al cargar la condición');
      router.push('/dashboard/conditions');
    } finally {
      setLoading(false);
    }
  }, [conditionId, router]);

  useEffect(() => {
    fetchCondition();
  }, [fetchCondition]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!condition) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Condición no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/conditions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{condition.name}</h1>
            <p className="text-gray-500">Detalles de la condición</p>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push(`/dashboard/conditions/${condition.id}/edit`)
          }
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Información de la Condición</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-lg font-semibold">{condition.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre
                </label>
                <p className="text-lg font-semibold">{condition.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Slug
                </label>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {condition.slug}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Creación
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(condition.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Actualización
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(condition.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{condition.name}</h3>
              <p className="text-gray-500">Slug: {condition.slug}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
