'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
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
  Info,
} from 'lucide-react';
import { getAdReservation } from '@/lib/strapi';
import { StrapiAdReservation } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';
import { InfoField } from '@/components/ui/info-field';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
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
      router.push('/reservations');
    } finally {
      setLoading(false);
    }
  }, [reservationId, router]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

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
  const reservationsHref = '/reservations/used';
  const reservationsSectionHref = isUsed
    ? '/reservations/used'
    : '/reservations/free';
  const reservationsSectionLabel = isUsed ? 'Usadas' : 'Libres';
  const breadcrumbsItems = [
    { label: 'Waldo', href: '/' },
    { label: 'Reservas', href: reservationsHref },
    { label: reservationsSectionLabel, href: reservationsSectionHref },
    { label: `Reserva #${reservation.id}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbsItems} />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              Reserva #{reservation.id}
            </h1>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información principal de la reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Información de la Reserva</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={reservation.id} />
                  <InfoField
                    label="Precio"
                    value={formatPrice(reservation.price)}
                  />
                  <InfoField
                    label="Duración"
                    value={`${reservation.total_days || 0} días`}
                  />
                  <div>
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: '#313338' }}
                    >
                      Estado
                    </label>
                    <div className="mt-1">
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

                {/* Descripción */}
                {reservation.description && (
                  <InfoField
                    label="Descripción"
                    value={reservation.description}
                  />
                )}
              </CardContent>
            </Card>

            {/* Información del usuario */}
            {reservation.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Usuario
                    </span>
                    <Button
                      variant="brandOutline"
                      size="brand"
                      onClick={() =>
                        reservation.user &&
                        router.push(`/users/${reservation.user.id}`)
                      }
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Usuario
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="Nombre de Usuario"
                      value={reservation.user.username}
                      type="link"
                      href={`/users/${reservation.user.id}`}
                    />
                    <InfoField
                      label="Email"
                      value={reservation.user.email}
                      type="email"
                    />
                    <InfoField
                      label="Estado"
                      value={`${reservation.user.confirmed ? 'Confirmado' : 'No Confirmado'}, ${reservation.user.blocked ? 'Bloqueado' : 'Activo'}`}
                    />
                    <InfoField
                      label="Proveedor"
                      value={reservation.user.provider}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información del anuncio (solo si está usada) */}
            {reservation.ad && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Anuncio Asociado
                    </span>
                    <Button
                      variant="brandOutline"
                      size="brand"
                      onClick={() =>
                        reservation.ad &&
                        router.push(`/ads/${reservation.ad.id}`)
                      }
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Anuncio
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Nombre" value={reservation.ad.name} />
                    <InfoField
                      label="Precio del Anuncio"
                      value={formatPrice(reservation.ad.price)}
                    />
                    <InfoField
                      label="Categoría"
                      value={reservation.ad.category?.name}
                    />
                    <InfoField
                      label="Comuna"
                      value={reservation.ad.commune?.name}
                    />
                    <InfoField
                      label="Estado"
                      value={`${reservation.ad.active ? 'Activo' : 'Inactivo'}${reservation.ad.rejected ? ', Rechazado' : ''}`}
                    />
                    <InfoField
                      label="Propietario del Anuncio"
                      value={reservation.ad.user?.username}
                    />
                  </div>

                  {reservation.ad.description && (
                    <InfoField
                      label="Descripción del Anuncio"
                      value={reservation.ad.description}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Detalles */}
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
                  value={formatDate(reservation.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(reservation.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
