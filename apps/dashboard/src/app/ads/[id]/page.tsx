'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { CustomTag } from '@/components/ui/custom-tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonViewerButton } from '@/components/ui/json-viewer-button';
import {
  ArrowLeft,
  Package,
  User,
  Eye,
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
import { GalleryDefault } from '@/components/ui/gallery-default';
import { InfoField } from '@/components/ui/info-field';
import { useFormatDate } from '@/hooks/useFormatDate';

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
  const { formatDate } = useFormatDate();
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
      setApproveDialogOpen(false);
      await approveAd(ad.id);
      // Redirigir a la lista de anuncios activos después de aprobar
      router.push('/ads/active');
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

  const breadcrumbItems = [
    { label: 'Waldo', href: '/' },
    { label: 'Anuncios', href: '/ads/pending' },
    ...(ad.category?.name
      ? [{ label: ad.category.name, href: '/ads/pending' }]
      : []),
    { label: ad.name },
  ];

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

      <div className="pt-4 pb-4 space-y-2">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              {ad.name}
            </h1>
            <p className="text-gray-600">Detalles del anuncio</p>
          </div>
          <div className="flex space-x-2">
            {!ad.active &&
              ad.remaining_days > 0 &&
              ad.remaining_days === ad.duration_days &&
              !ad.rejected && (
                <>
                  <Button
                    variant="brand"
                    size="brand"
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
                  </Button>
                  <Button
                    variant="brandSecondary"
                    size="brand"
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
                  </Button>
                </>
              )}
            {ad.active && ad.remaining_days > 0 && (
              <Button
                variant="brandOutline"
                size="brand"
                onClick={() => window.open(getPublicAdUrl(ad), '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Anuncio
              </Button>
            )}
            <JsonViewerButton
              data={ad}
              title={`JSON del Anuncio: ${ad.name}`}
              buttonText="Ver JSON"
              buttonVariant="outline"
            />
            <Button
              variant="brandGhost"
              size="brand"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
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
                <InfoField label="Nombre" value={ad.name} />
                <InfoField
                  label="Precio"
                  value={formatPrice(ad.price, ad.currency)}
                />
                <InfoField label="Categoría" value={ad.category?.name} />
                <InfoField label="Condición" value={ad.condition?.name} />
                <InfoField
                  label="Dirección"
                  value={
                    ad.address && ad.address_number && ad.commune?.name
                      ? `${ad.address} ${ad.address_number}, ${ad.commune.name}`
                      : ad.address && ad.commune?.name
                        ? `${ad.address}, ${ad.commune.name}`
                        : `${ad.address || ''}${ad.address && ad.address_number ? ' ' : ''}${ad.address_number || ''}${(ad.address || ad.address_number) && ad.commune?.name ? ', ' : ''}${ad.commune?.name || ''}` ||
                          null
                  }
                />
                <InfoField label="Teléfono" value={ad.phone} type="phone" />
                <InfoField label="Email" value={ad.email} type="email" />
                <InfoField label="Fabricante" value={ad.manufacturer} />
                <InfoField label="Modelo" value={ad.model} />
                <InfoField label="Año" value={ad.year} />
                <InfoField label="Número de Serie" value={ad.serial_number} />
                {ad.weight && (
                  <InfoField label="Peso" value={`${ad.weight} kg`} />
                )}
                {(ad.width || ad.height || ad.depth) && (
                  <InfoField
                    label="Dimensiones"
                    value={[
                      ad.width && `${ad.width} cm`,
                      ad.height && `${ad.height} cm`,
                      ad.depth && `${ad.depth} cm`,
                    ]
                      .filter(Boolean)
                      .join(' × ')}
                  />
                )}
              </div>

              {ad.description && (
                <InfoField label="Descripción" value={ad.description} />
              )}
            </CardContent>
          </Card>

          {/* Galería de Imágenes */}
          {ad.gallery && ad.gallery.length > 0 && (
            <GalleryDefault images={ad.gallery} />
          )}

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
                  <InfoField label="Estado" value="Rechazado" />
                  <InfoField
                    label="Fecha de Rechazo"
                    value={formatDate(ad.updatedAt)}
                  />
                </div>
                <InfoField
                  label="Motivo del Rechazo"
                  value={ad.reason_for_rejection || 'No se especificó motivo'}
                />
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
                  <Button
                    variant="brandOutline"
                    size="brand"
                    onClick={() => router.push(`/users/${extendedUser.id}`)}
                    className="flex items-center"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Ver Usuario
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={extendedUser.id} />
                  <InfoField
                    label="Username"
                    value={extendedUser.username}
                    type="link"
                    href={`/users/${extendedUser.id}`}
                  />
                  <InfoField
                    label="Email"
                    value={extendedUser.email}
                    type="email"
                  />
                  <InfoField label="Proveedor" value={extendedUser.provider} />
                  <InfoField
                    label="Confirmado"
                    value={extendedUser.confirmed ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Bloqueado"
                    value={extendedUser.blocked ? 'Sí' : 'No'}
                  />
                  <InfoField label="Nombre" value={extendedUser.firstname} />
                  <InfoField label="Apellido" value={extendedUser.lastname} />
                  <InfoField label="RUT" value={extendedUser.rut} />
                  <InfoField
                    label="Teléfono"
                    value={extendedUser.phone}
                    type="phone"
                  />
                  <InfoField
                    label="Es Empresa"
                    value={extendedUser.is_company ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Pro"
                    value={extendedUser.pro ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Código Postal"
                    value={extendedUser.postal_code}
                  />
                  <InfoField
                    label="Dirección"
                    value={
                      extendedUser.address && extendedUser.address_number
                        ? `${extendedUser.address} ${extendedUser.address_number}`
                        : extendedUser.address || null
                    }
                  />
                  <InfoField
                    label="Fecha de Nacimiento"
                    value={extendedUser.birthdate}
                  />
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
                        <InfoField
                          label="Nombre de Empresa"
                          value={extendedUser.business_name}
                        />
                        <InfoField
                          label="Tipo de Negocio"
                          value={extendedUser.business_type}
                        />
                        <InfoField
                          label="RUT de Empresa"
                          value={extendedUser.business_rut}
                        />
                        <InfoField
                          label="Dirección de Empresa"
                          value={
                            extendedUser.business_address &&
                            extendedUser.business_address_number
                              ? `${extendedUser.business_address} ${extendedUser.business_address_number}`
                              : extendedUser.business_address || null
                          }
                        />
                        <InfoField
                          label="Código Postal de Empresa"
                          value={extendedUser.business_postal_code}
                        />
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
                  <Button
                    variant="brandOutline"
                    size="brand"
                    onClick={() => router.push(`/sales/${order.id}`)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle Completo
                  </Button>
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
                    <InfoField label="ID de Orden" value={`#${order.id}`} />
                    <InfoField
                      label="Fecha de Compra"
                      value={formatDate(order.createdAt)}
                    />
                    <InfoField
                      label="Monto Total"
                      value={formatCurrency(
                        typeof order.amount === 'string'
                          ? parseFloat(order.amount)
                          : order.amount,
                        'CLP'
                      )}
                    />
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
                    <InfoField
                      label="Número de Orden de Compra"
                      value={order.buy_order}
                    />
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
              <div className="grid grid-cols-1 gap-4">
                <InfoField
                  label="Duración"
                  value={`${ad.duration_days} días`}
                />
                <InfoField
                  label="Días Restantes"
                  value={`${ad.remaining_days} días`}
                />
                <InfoField label="Creado" value={formatDate(ad.createdAt)} />
                <InfoField
                  label="Actualizado"
                  value={formatDate(ad.updatedAt)}
                />
              </div>

              {ad.reason_for_rejection && (
                <InfoField
                  label="Motivo de Rechazo"
                  value={ad.reason_for_rejection}
                />
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
                <div className="grid grid-cols-1 gap-4">
                  {ad.details.pack !== undefined && (
                    <InfoField
                      label="Pack"
                      value={
                        typeof ad.details.pack === 'string' ||
                        typeof ad.details.pack === 'number'
                          ? ad.details.pack
                          : null
                      }
                    />
                  )}
                  {ad.details.featured !== undefined && (
                    <InfoField
                      label="Destacado"
                      value={ad.details.featured ? 'Sí' : 'No'}
                    />
                  )}
                  {ad.details.is_invoice !== undefined && (
                    <InfoField
                      label="Facturación"
                      value={ad.details.is_invoice ? 'Sí' : 'No'}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
