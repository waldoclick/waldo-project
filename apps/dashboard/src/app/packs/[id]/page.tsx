'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoField } from '@/components/ui/info-field';
import {
  ArrowLeft,
  Edit,
  Package,
  Info,
  DollarSign,
  Clock,
  Star,
  Box,
} from 'lucide-react';
import { getAdPack } from '@/lib/strapi';
import { StrapiAdPack } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function PackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pack, setPack] = useState<StrapiAdPack | null>(null);
  const [loading, setLoading] = useState(true);

  const packId = params.id as string;

  const fetchPack = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdPack(parseInt(packId));
      setPack(response.data);
    } catch (error) {
      console.error('Error fetching pack:', error);
      alert('Error al cargar el pack');
      router.push('/packs');
    } finally {
      setLoading(false);
    }
  }, [packId, router]);

  useEffect(() => {
    fetchPack();
  }, [fetchPack]);

  const { formatDate } = useFormatDate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Pack no encontrado</p>
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
              { label: 'Packs', href: '/packs' },
              { label: pack.name },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                {pack.name}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button onClick={() => router.push(`/packs/${pack.id}/edit`)}>
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
                  <Package className="h-5 w-5 mr-2" />
                  Información del Pack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={pack.id} />
                  <InfoField label="Nombre" value={pack.name} />
                  <InfoField label="Texto" value={pack.text} />
                  <InfoField label="Precio" value={formatPrice(pack.price)} />
                  <InfoField
                    label="Duración"
                    value={`${pack.total_days} días`}
                  />
                  <InfoField
                    label="Total de Anuncios"
                    value={`${pack.total_ads} anuncios`}
                  />
                  <InfoField
                    label="Features Incluidas"
                    value={`${pack.total_features} features`}
                  />
                </div>
                {pack.description && (
                  <div>
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: '#313338' }}
                    >
                      Descripción
                    </label>
                    <div className="mt-1 prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {pack.description}
                      </p>
                    </div>
                  </div>
                )}
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
                <InfoField label="Creado" value={formatDate(pack.createdAt)} />
                <InfoField
                  label="Actualizado"
                  value={formatDate(pack.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
