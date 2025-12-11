'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { InputSearch } from '@/components/ui/input-search';
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
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferences';

export default function SalesPage() {
  const { orders: ordersPrefs, setOrdersPreferences } = usePreferencesStore();
  const [orders, setOrders] = useState<StrapiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Cargar preferencias al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      setSearchTerm(ordersPrefs.searchTerm);
      setPageSize(ordersPrefs.pageSize);
      setSortBy(ordersPrefs.sortBy);
      setIsInitialized(true);
    }
  }, [ordersPrefs, isInitialized]);

  // Guardar preferencias cuando cambien (solo después de la inicialización)
  useEffect(() => {
    if (isInitialized) {
      setOrdersPreferences({
        searchTerm,
        pageSize,
        sortBy,
      });
    }
  }, [searchTerm, pageSize, sortBy, setOrdersPreferences, isInitialized]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOrders({
        page: currentPage,
        pageSize: pageSize,
        sort: sortBy,
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
  }, [currentPage, searchTerm, pageSize, sortBy]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset to page 1 when search term, page size, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize, sortBy]);

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
          </div>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar órdenes..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {sortBy === 'createdAt:desc' && 'Más recientes'}
                      {sortBy === 'createdAt:asc' && 'Más antiguos'}
                      {sortBy === 'ad.name:asc' && 'Título A-Z'}
                      {sortBy === 'ad.name:desc' && 'Título Z-A'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:desc')}
                    >
                      Más recientes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:asc')}
                    >
                      Más antiguos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('ad.name:asc')}>
                      Título A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('ad.name:desc')}>
                      Título Z-A
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {pageSize} por página
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPageSize(5)}>
                      5
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(10)}>
                      10
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(25)}>
                      25
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(50)}>
                      50
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(100)}>
                      100
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                              onClick={() => router.push(`/sales/${order.id}`)}
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
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
