'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  User,
  FileText,
  Package,
  Link,
  Info,
} from 'lucide-react';
import { getOrder, StrapiOrder } from '@/lib/strapi';
import { InfoField } from '@/components/ui/info-field';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [order, setOrder] = useState<StrapiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOrder(parseInt(orderId));

      console.log('Order detail response:', response);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('No se pudo cargar la orden');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const formatCurrency = (amount: number, currency: string = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Orden no encontrada'}</p>
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
              { label: 'Órdenes', href: '/sales' },
              { label: `Orden #${order.id}` },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Orden #{order.id}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de la orden */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Información de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Número de Orden" value={order.buy_order} />
                  <InfoField label="ID" value={order.id} />
                  <InfoField
                    label="Monto"
                    value={formatCurrency(
                      typeof order.amount === 'string'
                        ? parseFloat(order.amount)
                        : order.amount,
                      'CLP'
                    )}
                  />
                  <InfoField
                    label="Tipo de Documento"
                    value={order.is_invoice ? 'Factura' : 'Boleta'}
                  />
                  <InfoField
                    label="Método de Pago"
                    value={
                      order.payment_method === 'webpay'
                        ? 'WebPay'
                        : order.payment_method
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del cliente */}
            {order.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Información del Cliente
                    </span>
                    <Button
                      variant="brandOutline"
                      size="header"
                      onClick={() =>
                        order.user && router.push(`/users/${order.user.id}`)
                      }
                      className="flex items-center"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Ver Usuario
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="Usuario"
                      value={order.user.username}
                      type="link"
                      href={`/users/${order.user.id}`}
                    />
                    <InfoField
                      label="Email"
                      value={order.user.email}
                      type="email"
                    />
                    <InfoField label="ID del Cliente" value={order.user.id} />
                    <InfoField
                      label="Estado"
                      value={order.user.confirmed ? 'Confirmado' : 'Pendiente'}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información del anuncio */}
            {order.ad && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Información del Anuncio
                    </span>
                    <Button
                      variant="brandOutline"
                      size="brand"
                      onClick={() =>
                        order.ad && router.push(`/ads/${order.ad.id}`)
                      }
                      className="flex items-center"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Ver Anuncio
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Nombre" value={order.ad.name} />
                    <InfoField
                      label="Precio"
                      value={formatCurrency(order.ad.price, order.ad.currency)}
                    />
                    <InfoField
                      label="ID del Anuncio"
                      value={order.ad.id}
                      type="link"
                      href={`/ads/${order.ad.id}`}
                    />
                    <InfoField
                      label="Estado"
                      value={order.ad.active ? 'Activo' : 'Inactivo'}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detalles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.document_details && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Detalles del Documento
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded-sm overflow-auto">
                      {JSON.stringify(order.document_details, null, 2)}
                    </pre>
                  </div>
                )}

                {order.payment_response && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Respuesta de Pago
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded-sm overflow-auto">
                      {JSON.stringify(order.payment_response, null, 2)}
                    </pre>
                  </div>
                )}

                {order.document_response && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Respuesta de Documento
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded-sm overflow-auto">
                      {JSON.stringify(order.document_response, null, 2)}
                    </pre>
                  </div>
                )}

                {order.items && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Items
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded-sm overflow-auto">
                      {JSON.stringify(order.items, null, 2)}
                    </pre>
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
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField label="Creado" value={formatDate(order.createdAt)} />
                <InfoField
                  label="Actualizado"
                  value={formatDate(order.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
