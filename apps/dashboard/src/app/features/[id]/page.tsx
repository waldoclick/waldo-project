'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  User,
  Package,
  Hash,
  Star,
  XCircle,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { getAdFeaturedReservation } from '@/lib/strapi';
import { StrapiAdFeaturedReservation } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function DestacadoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [featured, setFeatured] = useState<StrapiAdFeaturedReservation | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const featuredId = params.id as string;

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdFeaturedReservation(parseInt(featuredId));
      setFeatured(response.data);
    } catch (error) {
      console.error('Error fetching featured reservation:', error);
      alert('Error al cargar el destacado');
      router.push('/features');
    } finally {
      setLoading(false);
    }
  }, [featuredId, router]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

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

  if (!featured) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Destacado no encontrado</p>
      </div>
    );
  }

  const isUsed = !!featured.ad;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/features')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Destacado #{featured.id}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {isUsed ? (
                <Badge
                  variant="default"
                  className="bg-yellow-100 text-yellow-800"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Usado
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Libre
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información principal del destacado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Información del Destacado</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-semibold">{featured.id}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Precio
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(featured.price)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Duración
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {featured.total_days || 0} días
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <div className="mt-1">
                  {isUsed ? (
                    <Badge
                      variant="default"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Destacado Usado
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Destacado Libre
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Creación
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(featured.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Actualización
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(featured.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {featured.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Descripción
              </label>
              <div className="mt-2 p-3 bg-gray-50 rounded-sm">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {featured.description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del usuario */}
      {featured.user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Usuario</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/users/${featured.user?.id}`)}
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Usuario
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre de Usuario
                </label>
                <p className="text-lg font-semibold">
                  {featured.user.username}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{featured.user.email}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <div className="flex space-x-2">
                  <Badge
                    variant={
                      featured.user.confirmed ? 'default' : 'destructive'
                    }
                  >
                    {featured.user.confirmed ? 'Confirmado' : 'No Confirmado'}
                  </Badge>
                  <Badge
                    variant={featured.user.blocked ? 'destructive' : 'default'}
                  >
                    {featured.user.blocked ? 'Bloqueado' : 'Activo'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Proveedor
                </label>
                <p>{featured.user.provider}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información del anuncio (solo si está usado) */}
      {featured.ad && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Anuncio Destacado</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/ads/${featured.ad?.id}`)}
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Anuncio
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre
                </label>
                <p className="text-lg font-semibold">{featured.ad.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Precio del Anuncio
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatPrice(featured.ad.price)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Categoría
                </label>
                <p>{featured.ad.category?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Comuna
                </label>
                <p>{featured.ad.commune?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <div className="flex space-x-2">
                  <Badge variant={featured.ad.active ? 'default' : 'secondary'}>
                    {featured.ad.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {featured.ad.rejected && (
                    <Badge variant="destructive">Rechazado</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Propietario del Anuncio
                </label>
                <p>{featured.ad.user?.username || 'N/A'}</p>
              </div>
            </div>

            {featured.ad.description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">
                  Descripción del Anuncio
                </label>
                <div className="mt-2 p-3 bg-gray-50 rounded-sm">
                  <p className="text-gray-700">{featured.ad.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen del destacado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Resumen del Destacado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-sm">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(featured.price)}
              </p>
              <p className="text-sm text-gray-600">Precio</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-sm">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {featured.total_days || 0}
              </p>
              <p className="text-sm text-gray-600">Días</p>
            </div>
            <div
              className={`text-center p-3 rounded-sm ${
                isUsed ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              {isUsed ? (
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              )}
              <p
                className={`text-2xl font-bold ${isUsed ? 'text-yellow-600' : 'text-gray-600'}`}
              >
                {isUsed ? 'Usado' : 'Libre'}
              </p>
              <p className="text-sm text-gray-600">Estado</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-sm">
              <Hash className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                #{featured.id}
              </p>
              <p className="text-sm text-gray-600">ID</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
