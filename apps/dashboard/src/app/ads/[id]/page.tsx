'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CustomButton } from '@/components/ui/custom-button';
import { CustomTag } from '@/components/ui/custom-tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonViewerButton } from '@/components/ui/json-viewer-button';
import {
  ArrowLeft,
  Calendar,
  Package,
  User,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Link,
  Building2,
  ShoppingCart,
} from 'lucide-react';
import { getAd, approveAd, rejectAd, getAdOrders } from '@/lib/strapi';
import { StrapiAd, StrapiOrder } from '@/lib/strapi';
import { RejectDialog } from '@/components/ui/reject-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Extend the user type to include additional fields
interface ExtendedUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  firstname?: string;
  lastname?: string;
  rut?: string;
  phone?: string;
  is_company?: boolean;
  pro?: boolean;
  postal_code?: string;
  address?: string;
  address_number?: string;
  birthdate?: string;
  documentId?: string;
  publishedAt?: string;
  business_name?: string;
  business_type?: string;
  business_rut?: string;
  business_address?: string;
  business_address_number?: string;
  business_postal_code?: string;
}

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<StrapiAd | null>(null);
  const [order, setOrder] = useState<StrapiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const adId = params.id as string;

  const fetchAd = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAd(parseInt(adId));

      // Debug específico para ver la estructura real
      console.log('Ad detail response:', response);
      console.log('Ad data:', response.data);
      console.log('Ad category:', response.data?.category);
      console.log('Ad commune:', response.data?.commune);
      console.log('Ad user:', response.data?.user);

      setAd(response.data);
    } catch (error) {
      console.error('Error fetching ad:', error);
      setError('No se pudo cargar el anuncio');
    } finally {
      setLoading(false);
    }
  }, [adId]);

  const fetchOrder = useCallback(async () => {
    if (!adId) return;

    try {
      setOrderLoading(true);
      const response = await getAdOrders(parseInt(adId), {
        sort: 'createdAt:desc',
        pageSize: 1,
      });
      // Solo tomar la primera orden (debería ser la única)
      setOrder(response.data.length > 0 ? response.data[0] : null);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setOrderLoading(false);
    }
  }, [adId]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  useEffect(() => {
    if (ad) {
      fetchOrder();
    }
  }, [ad, fetchOrder]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const formatCurrency = (amount: number, currency: string = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'webpay':
        return <Badge variant="default">WebPay</Badge>;
      default:
        return <Badge variant="secondary">{method}</Badge>;
    }
  };

  const getInvoiceBadge = (isInvoice: boolean) => {
    return isInvoice ? (
      <Badge variant="default">Facturado</Badge>
    ) : (
      <Badge variant="outline">Sin factura</Badge>
    );
  };

  const getPublicAdUrl = (ad: StrapiAd) => {
    const publicSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    return `${publicSiteUrl}/anuncios/${ad.slug}`;
  };

  const getStatusBadge = (ad: StrapiAd) => {
    console.log('Ad status debug:', {
      id: ad.id,
      active: ad.active,
      rejected: ad.rejected,
      remaining_days: ad.remaining_days,
      duration_days: ad.duration_days,
    });

    // Si está rechazado, ese es el estado principal
    if (ad.rejected) {
      return <CustomTag variant="warning">Rechazado</CustomTag>;
    }

    // Si está activo y remaining_days > 0, está activo
    if (ad.active && ad.remaining_days > 0) {
      return <CustomTag variant="success">Activo</CustomTag>;
    }

    // Si no está activo, remaining_days > 0, y remaining_days === duration_days, está pendiente
    if (
      !ad.active &&
      ad.remaining_days > 0 &&
      ad.remaining_days === ad.duration_days
    ) {
      return <CustomTag variant="warning">Pendiente</CustomTag>;
    }

    // Si no está activo y remaining_days === 0, está archivado
    if (!ad.active && ad.remaining_days === 0) {
      return <CustomTag variant="neutral">Archivado</CustomTag>;
    }

    // Estado por defecto
    return <CustomTag variant="neutral">Inactivo</CustomTag>;
  };

  const handleApprove = async () => {
    if (!ad) return;

    try {
      await approveAd(ad.id);
      // Recargar los datos del anuncio después de aprobar
      await fetchAd();
      // Mostrar notificación de éxito
      setNotification({
        show: true,
        message: 'Anuncio aprobado exitosamente',
        type: 'success',
      });
      // Ocultar notificación después de 3 segundos
      setTimeout(
        () => setNotification({ show: false, message: '', type: 'success' }),
        3000
      );
    } catch (error) {
      console.error('Error al aprobar el anuncio:', error);
      setNotification({
        show: true,
        message: 'Error al aprobar el anuncio. Inténtalo de nuevo.',
        type: 'error',
      });
      setTimeout(
        () => setNotification({ show: false, message: '', type: 'success' }),
        3000
      );
    }
  };

  const handleReject = async () => {
    if (!ad) return;

    try {
      await rejectAd(ad.id);
      // Recargar los datos del anuncio después de rechazar
      await fetchAd();
      // Mostrar notificación de éxito
      setNotification({
        show: true,
        message: 'Anuncio rechazado exitosamente',
        type: 'success',
      });
      setTimeout(
        () => setNotification({ show: false, message: '', type: 'success' }),
        3000
      );
    } catch (error) {
      console.error('Error al rechazar el anuncio:', error);
      setNotification({
        show: true,
        message: 'Error al rechazar el anuncio. Inténtalo de nuevo.',
        type: 'error',
      });
      setTimeout(
        () => setNotification({ show: false, message: '', type: 'success' }),
        3000
      );
    }
  };

  const openApproveDialog = () => {
    setApproveDialogOpen(true);
  };

  const openRejectDialog = () => {
    setRejectDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Anuncio no encontrado'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  // Cast user to extended type for additional fields
  const extendedUser = ad.user as ExtendedUser;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notification banner */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Approve Dialog */}
      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Aprobar Anuncio"
        description={`¿Estás seguro de que quieres aprobar este anuncio?${ad?.name ? ` "${ad.name}"` : ''}`}
        confirmText="Aprobar"
        onConfirm={handleApprove}
      />

      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleReject}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{ad.name}</h1>
          <p className="text-gray-600">Detalles del anuncio</p>
        </div>
        <div className="flex space-x-2">
          {!ad.active &&
            ad.remaining_days > 0 &&
            ad.remaining_days === ad.duration_days &&
            !ad.rejected && (
              <>
                <CustomButton
                  variant="primary"
                  onClick={openApproveDialog}
                  disabled={ad.needs_payment}
                  title={
                    ad.needs_payment
                      ? 'No se puede aprobar: pendiente de pago'
                      : ''
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </CustomButton>
                <CustomButton
                  variant="secondary"
                  onClick={openRejectDialog}
                  disabled={ad.needs_payment}
                  title={
                    ad.needs_payment
                      ? 'No se puede rechazar: pendiente de pago'
                      : ''
                  }
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </CustomButton>
              </>
            )}
          {ad.active && ad.remaining_days > 0 && (
            <CustomButton
              variant="outline"
              onClick={() => window.open(getPublicAdUrl(ad), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Anuncio
            </CustomButton>
          )}
          <JsonViewerButton
            data={ad}
            title={`JSON del Anuncio: ${ad.name}`}
            buttonText="Ver JSON"
            buttonVariant="outline"
          />
          <CustomButton variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </CustomButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre
                  </label>
                  <p className="text-lg font-semibold">{ad.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Precio
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatPrice(ad.price, ad.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Categoría
                  </label>
                  <p>{ad.category?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Condición
                  </label>
                  <p>{ad.condition?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dirección
                  </label>
                  <p>
                    {ad.address && ad.address_number && ad.commune?.name ? (
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(`${ad.address} ${ad.address_number}, ${ad.commune.name}, Chile`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        {ad.address} {ad.address_number}, {ad.commune.name}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    ) : ad.address && ad.commune?.name ? (
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(`${ad.address}, ${ad.commune.name}, Chile`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        {ad.address}, {ad.commune.name}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    ) : (
                      `${ad.address || ''}${ad.address && ad.address_number ? ' ' : ''}${ad.address_number || ''}${(ad.address || ad.address_number) && ad.commune?.name ? ', ' : ''}${ad.commune?.name || ''}` ||
                      '-'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Teléfono
                  </label>
                  <p>
                    {ad.phone ? (
                      <a
                        href={`tel:${ad.phone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {ad.phone}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p>
                    {ad.email ? (
                      <a
                        href={`mailto:${ad.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {ad.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fabricante
                  </label>
                  <p>{ad.manufacturer || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Modelo
                  </label>
                  <p>{ad.model || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Año
                  </label>
                  <p>{ad.year || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Número de Serie
                  </label>
                  <p>{ad.serial_number || '-'}</p>
                </div>
                {ad.weight && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Peso
                    </label>
                    <p>{ad.weight} kg</p>
                  </div>
                )}
                {(ad.width || ad.height || ad.depth) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Dimensiones
                    </label>
                    <p>
                      {[
                        ad.width && `${ad.width} cm`,
                        ad.height && `${ad.height} cm`,
                        ad.depth && `${ad.depth} cm`,
                      ]
                        .filter(Boolean)
                        .join(' × ')}
                    </p>
                  </div>
                )}
              </div>

              {ad.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Descripción
                  </label>
                  <p className="text-gray-700">{ad.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de rechazo */}
          {ad.rejected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  Información de Rechazo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Estado
                    </label>
                    <p className="text-white font-semibold">Rechazado</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Fecha de Rechazo
                    </label>
                    <p>{formatDate(ad.updatedAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Motivo del Rechazo
                  </label>
                  {ad.reason_for_rejection ? (
                    <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      {ad.reason_for_rejection}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No se especificó motivo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del usuario */}
          {ad.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información del Usuario
                  </span>
                  <CustomButton
                    variant="outline"
                    onClick={() => router.push(`/users/${extendedUser.id}`)}
                    className="flex items-center"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Ver Usuario
                  </CustomButton>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID
                    </label>
                    <p>{extendedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Username
                    </label>
                    <p>{extendedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p>
                      {extendedUser.email ? (
                        <a
                          href={`mailto:${extendedUser.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {extendedUser.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Proveedor
                    </label>
                    <p>{extendedUser.provider}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Confirmado
                    </label>
                    <p>{extendedUser.confirmed ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Bloqueado
                    </label>
                    <p>{extendedUser.blocked ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre
                    </label>
                    <p>{extendedUser.firstname || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Apellido
                    </label>
                    <p>{extendedUser.lastname || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      RUT
                    </label>
                    <p>{extendedUser.rut || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Teléfono
                    </label>
                    <p>
                      {extendedUser.phone ? (
                        <a
                          href={`tel:${extendedUser.phone}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {extendedUser.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Es Empresa
                    </label>
                    <p>{extendedUser.is_company ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Pro
                    </label>
                    <p>{extendedUser.pro ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Código Postal
                    </label>
                    <p>{extendedUser.postal_code || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Dirección
                    </label>
                    <p>
                      {extendedUser.address && extendedUser.address_number ? (
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(`${extendedUser.address} ${extendedUser.address_number}, Chile`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                        >
                          {extendedUser.address} {extendedUser.address_number}
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      ) : extendedUser.address ? (
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(`${extendedUser.address}, Chile`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                        >
                          {extendedUser.address}
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      ) : (
                        `${extendedUser.address || ''}${extendedUser.address && extendedUser.address_number ? ' ' : ''}${extendedUser.address_number || ''}` ||
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Fecha de Nacimiento
                    </label>
                    <p>{extendedUser.birthdate || '-'}</p>
                  </div>
                </div>

                {/* Información de empresa - solo si es empresa */}
                {extendedUser.is_company && (
                  <>
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        Información de Empresa
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Nombre de Empresa
                          </label>
                          <p>{extendedUser.business_name || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Tipo de Negocio
                          </label>
                          <p>{extendedUser.business_type || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            RUT de Empresa
                          </label>
                          <p>{extendedUser.business_rut || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Dirección de Empresa
                          </label>
                          <p>
                            {extendedUser.business_address &&
                            extendedUser.business_address_number ? (
                              <a
                                href={`https://www.google.com/maps/search/${encodeURIComponent(`${extendedUser.business_address} ${extendedUser.business_address_number}, Chile`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                              >
                                {extendedUser.business_address}{' '}
                                {extendedUser.business_address_number}
                                <ExternalLink className="h-4 w-4 ml-1" />
                              </a>
                            ) : extendedUser.business_address ? (
                              <a
                                href={`https://www.google.com/maps/search/${encodeURIComponent(`${extendedUser.business_address}, Chile`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                              >
                                {extendedUser.business_address}
                                <ExternalLink className="h-4 w-4 ml-1" />
                              </a>
                            ) : (
                              `${extendedUser.business_address || ''}${extendedUser.business_address && extendedUser.business_address_number ? ' ' : ''}${extendedUser.business_address_number || ''}` ||
                              '-'
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Código Postal de Empresa
                          </label>
                          <p>{extendedUser.business_postal_code || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Orden de compra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Orden de Compra
                </span>
                {order && (
                  <CustomButton
                    variant="outline"
                    onClick={() => router.push(`/sales/${order.id}`)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle Completo
                  </CustomButton>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : order ? (
                <div className="space-y-6">
                  {/* Información principal de la orden */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID de Orden
                      </label>
                      <p className="text-lg font-semibold">#{order.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Fecha de Compra
                      </label>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Monto Total
                      </label>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(order.amount, 'CLP')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Método de Pago
                      </label>
                      <div className="mt-1">
                        {getPaymentMethodBadge(order.payment_method)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Facturación
                      </label>
                      <div className="mt-1">
                        {getInvoiceBadge(order.is_invoice)}
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {order.buy_order && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Número de Orden de Compra
                      </label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {order.buy_order}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Este anuncio no tiene una orden de compra asociada</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Puede ser un anuncio gratuito o no pagado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Detalles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Detalles
                </span>
                <div className="flex items-center space-x-2">
                  {ad.needs_payment ? (
                    <CustomTag variant="warning">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pendiente de Pago
                    </CustomTag>
                  ) : (
                    <CustomTag variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pagado
                    </CustomTag>
                  )}
                  <div>{getStatusBadge(ad)}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Duración
                  </label>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {ad.duration_days} días
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Días Restantes
                  </label>
                  <p className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {ad.remaining_days} días
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Creado
                  </label>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(ad.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Actualizado
                  </label>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(ad.updatedAt)}
                  </p>
                </div>
              </div>

              {ad.reason_for_rejection && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Motivo de Rechazo
                  </label>
                  <p className="text-red-600">{ad.reason_for_rejection}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles Adicionales */}
          {ad.details && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-64">
                  {JSON.stringify(ad.details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
