'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye,
  DollarSign,
  User,
  Calendar,
  FileText,
  Package,
  CreditCard,
} from 'lucide-react';
import { getOrders, StrapiOrder } from '@/lib/strapi';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
  const [orders, setOrders] = useState<StrapiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOrders({
        page: currentPage,
        pageSize: 25,
        sort: 'createdAt:desc',
        search: searchTerm || undefined,
      });

      console.log('Orders response:', response);
      setOrders(response.data);
      setTotalPages(response.meta.pagination.pageCount);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      <Badge variant="default">Factura</Badge>
    ) : (
      <Badge variant="outline">Boleta</Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Órdenes</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las órdenes de compra y ventas
            </p>
          </div>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Órdenes</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar órdenes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Orden</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Cliente</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>Anuncio</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Monto</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Método de Pago</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Tipo</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Fecha</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {order.user?.username || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {order.ad?.name || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(order.amount, order.ad?.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getPaymentMethodBadge(order.payment_method)}
                        </TableCell>
                        <TableCell>
                          {getInvoiceBadge(order.is_invoice)}
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(order.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/sales/${order.id}`)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {orders.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron órdenes</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
