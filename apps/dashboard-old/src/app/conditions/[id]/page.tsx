'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoField } from '@/components/ui/info-field';
import { ArrowLeft, Edit, Info, FileCheck } from 'lucide-react';
import { getCondition } from '@/lib/strapi/conditions';
import { StrapiCondition } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

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
      router.push('/conditions');
    } finally {
      setLoading(false);
    }
  }, [conditionId, router]);

  useEffect(() => {
    fetchCondition();
  }, [fetchCondition]);

  const { formatDate } = useFormatDate();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              {condition.name}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              onClick={() => router.push(`/conditions/${condition.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-2" />
                  Información de la Condición
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={condition.id} />
                  <InfoField label="Nombre" value={condition.name} />
                  <InfoField label="Slug" value={condition.slug} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
