'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoField } from '@/components/ui/info-field';
import { Edit, Building, Info } from 'lucide-react';
import { getCommune } from '@/lib/strapi/communes';
import { StrapiCommune } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function CommuneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [commune, setCommune] = useState<StrapiCommune | null>(null);
  const [loading, setLoading] = useState(true);

  const communeId = params.id as string;

  const fetchCommune = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCommune(parseInt(communeId));
      setCommune(response.data);
    } catch (error) {
      console.error('Error fetching commune:', error);
      alert('Error al cargar la comuna');
      router.push('/communes');
    } finally {
      setLoading(false);
    }
  }, [communeId, router]);

  useEffect(() => {
    fetchCommune();
  }, [fetchCommune]);

  const { formatDate } = useFormatDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!commune) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Comuna no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Waldo', href: '/' },
              { label: 'Comunas', href: '/communes' },
              { label: commune.name },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                {commune.name}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button
                size="header"
                onClick={() => router.push(`/communes/${commune.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Información de la Comuna
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={commune.id} />
                  <InfoField label="Nombre" value={commune.name} />
                  <InfoField label="Slug" value={commune.slug} />
                  {commune.region ? (
                    <InfoField
                      label="Región Asociada"
                      value={commune.region.name}
                      type="link"
                      href={`/regions/${commune.region.id}`}
                    />
                  ) : (
                    <InfoField
                      label="Región Asociada"
                      value="Sin región asignada"
                    />
                  )}
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
                  value={formatDate(commune.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(commune.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
