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
      router.push('/dashboard/packs');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/packs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pack.name}</h1>
            <p className="text-gray-500">{pack.text}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/dashboard/packs/${pack.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Información del Pack</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
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
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Duración
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {pack.total_days} días
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total de Anuncios
                </label>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {pack.total_ads} anuncios
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Features Incluidas
                </label>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {pack.total_features} features
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Descripción */}
      {pack.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Descripción</span>
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

      {/* Información de fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Información de Fechas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Fecha de Creación
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(pack.createdAt)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Última Actualización
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(pack.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen del pack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Resumen del Pack</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(pack.price)}
              </p>
              <p className="text-sm text-gray-600">Precio</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {pack.total_days}
              </p>
              <p className="text-sm text-gray-600">Días</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {pack.total_ads}
              </p>
              <p className="text-sm text-gray-600">Anuncios</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
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
  );
}
