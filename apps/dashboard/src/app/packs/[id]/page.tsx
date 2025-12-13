'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Package,
  Calendar,
  DollarSign,
  Clock,
  Star,
  FileText,
  Hash,
  Box,
} from 'lucide-react';
import { getAdPack } from '@/lib/strapi';
import { StrapiAdPack } from '@/lib/strapi/types';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              {pack.name}
            </h1>
            <p className="text-gray-600">{pack.text}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-lg font-semibold">{pack.id}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre
                    </label>
                    <p className="text-lg font-semibold">{pack.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Texto
                    </label>
                    <p className="text-gray-700">{pack.text}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Precio
                    </label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(pack.price)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Duración
                    </label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <Badge variant="outline">{pack.total_days} días</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total de Anuncios
                    </label>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-purple-500" />
                      <Badge variant="outline">{pack.total_ads} anuncios</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Features Incluidas
                    </label>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Badge variant="outline">
                        {pack.total_features} features
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción */}
            {pack.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Descripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {pack.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumen del pack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Resumen del Pack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-sm">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(pack.price)}
                    </p>
                    <p className="text-sm text-gray-600">Precio</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-sm">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {pack.total_days}
                    </p>
                    <p className="text-sm text-gray-600">Días</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-sm">
                    <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {pack.total_ads}
                    </p>
                    <p className="text-sm text-gray-600">Anuncios</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-sm">
                    <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {pack.total_features}
                    </p>
                    <p className="text-sm text-gray-600">Features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Información de Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Creación
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(pack.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Última Actualización
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(pack.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
