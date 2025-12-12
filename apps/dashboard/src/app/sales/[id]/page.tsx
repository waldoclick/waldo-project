'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Calendar,
  FileText,
  Package,
  CreditCard,
} from 'lucide-react';
import { getOrder, StrapiOrder } from '@/lib/strapi';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <Badge variant="default">Factura</Badge>
    ) : (
      <Badge variant="outline">Boleta</Badge>
    );
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
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Orden #{order.id}
            </h1>
            <p className="text-gray-600">Detalles de la orden de compra</p>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Número de Orden
                    </label>
                    <p className="text-lg font-semibold">{order.buy_order}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID
                    </label>
                    <p className="font-mono">{order.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Monto
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(
                        typeof order.amount === 'string'
                          ? parseFloat(order.amount)
                          : order.amount,
                        'CLP'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tipo de Documento
                    </label>
                    <div className="mt-1">
                      {getInvoiceBadge(order.is_invoice)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del cliente */}
            {order.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Usuario
                      </label>
                      <p className="font-medium">{order.user.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p>{order.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID del Cliente
                      </label>
                      <p className="font-mono text-sm">{order.user.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Estado
                      </label>
                      <div className="mt-1">
                        {order.user.confirmed ? (
                          <Badge variant="default">Confirmado</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información del anuncio */}
            {order.ad && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Información del Anuncio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Nombre
                      </label>
                      <p className="font-medium">{order.ad.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Precio
                      </label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(order.ad.price, order.ad.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID del Anuncio
                      </label>
                      <p className="font-mono text-sm">{order.ad.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Estado
                      </label>
                      <div className="mt-1">
                        {order.ad.active ? (
                          <Badge variant="default">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                    </div>
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
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(order.document_details, null, 2)}
                    </pre>
                  </div>
                )}

                {order.payment_response && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Respuesta de Pago
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(order.payment_response, null, 2)}
                    </pre>
                  </div>
                )}

                {order.document_response && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Respuesta de Documento
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(order.document_response, null, 2)}
                    </pre>
                  </div>
                )}

                {order.items && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Items
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(order.items, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Información de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    Monto Total
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(
                      typeof order.amount === 'string'
                        ? parseFloat(order.amount)
                        : order.amount,
                      'CLP'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Creado
                  </label>
                  <p className="text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Actualizado
                  </label>
                  <p className="text-sm">{formatDate(order.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
