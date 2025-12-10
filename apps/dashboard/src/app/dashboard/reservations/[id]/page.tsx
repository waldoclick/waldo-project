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
  FileText,
  Hash,
  CheckCircle,
  XCircle,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { getAdReservation } from '@/lib/strapi';
import { StrapiAdReservation } from '@/lib/strapi/types';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<StrapiAdReservation | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const reservationId = params.id as string;

  const fetchReservation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdReservation(parseInt(reservationId));
      setReservation(response.data);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      alert('Error al cargar la reserva');
      router.push('/dashboard/reservations');
    } finally {
      setLoading(false);
    }
  }, [reservationId, router]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

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

  if (!reservation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Reserva no encontrada</p>
      </div>
    );
  }

  const isUsed = !!reservation.ad;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/reservations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reserva #{reservation.id}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {isUsed ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Usada
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

      {/* Información principal de la reserva */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Información de la Reserva</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-semibold">
                    {reservation.id}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Precio
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(reservation.price)}
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
                    {reservation.total_days || 0} días
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
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reserva Usada
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reserva Libre
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
                  <span>{formatDate(reservation.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Actualización
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(reservation.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {reservation.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Descripción
              </label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {reservation.description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del usuario */}
      {reservation.user && (
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
                onClick={() =>
                  router.push(`/dashboard/users/${reservation.user?.id}`)
                }
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
                  {reservation.user.username}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{reservation.user.email}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <div className="flex space-x-2">
                  <Badge
                    variant={
                      reservation.user.confirmed ? 'default' : 'destructive'
                    }
                  >
                    {reservation.user.confirmed
                      ? 'Confirmado'
                      : 'No Confirmado'}
                  </Badge>
                  <Badge
                    variant={
                      reservation.user.blocked ? 'destructive' : 'default'
                    }
                  >
                    {reservation.user.blocked ? 'Bloqueado' : 'Activo'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Proveedor
                </label>
                <p>{reservation.user.provider}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información del anuncio (solo si está usada) */}
      {reservation.ad && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Anuncio Asociado</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/ads/${reservation.ad?.id}`)
                }
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
                <p className="text-lg font-semibold">{reservation.ad.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Precio del Anuncio
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatPrice(reservation.ad.price)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Categoría
                </label>
                <p>{reservation.ad.category?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Comuna
                </label>
                <p>{reservation.ad.commune?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <div className="flex space-x-2">
                  <Badge
                    variant={reservation.ad.active ? 'default' : 'secondary'}
                  >
                    {reservation.ad.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {reservation.ad.rejected && (
                    <Badge variant="destructive">Rechazado</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Propietario del Anuncio
                </label>
                <p>{reservation.ad.user?.username || 'N/A'}</p>
              </div>
            </div>

            {reservation.ad.description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">
                  Descripción del Anuncio
                </label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{reservation.ad.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen de la reserva */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Resumen de la Reserva</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(reservation.price)}
              </p>
              <p className="text-sm text-gray-600">Precio</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {reservation.total_days || 0}
              </p>
              <p className="text-sm text-gray-600">Días</p>
            </div>
            <div
              className={`text-center p-4 rounded-lg ${
                isUsed ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              {isUsed ? (
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              )}
              <p
                className={`text-2xl font-bold ${isUsed ? 'text-green-600' : 'text-gray-600'}`}
              >
                {isUsed ? 'Usada' : 'Libre'}
              </p>
              <p className="text-sm text-gray-600">Estado</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Hash className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                #{reservation.id}
              </p>
              <p className="text-sm text-gray-600">ID</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
