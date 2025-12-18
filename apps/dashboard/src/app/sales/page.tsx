'use client';

import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Eye, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useOrders } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function SalesPage() {
  const {
    data: orders,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    sortBy,
    setSortBy,
  } = useOrders();
  const router = useRouter();
  const { formatDate } = useFormatDate();

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

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
    { value: 'ad.name:asc', label: 'Título A-Z' },
    { value: 'ad.name:desc', label: 'Título Z-A' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[{ label: 'Waldo', href: '/' }, { label: 'Órdenes' }]}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Órdenes
              </h1>
            </div>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar órdenes..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <SortByData
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  options={sortOptions}
                />
                <SortPerPageSize
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="flex items-center justify-center py-8 px-5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">
                        <span>ID</span>
                      </TableHead>
                      <TableHead>
                        <span>Cliente</span>
                      </TableHead>
                      <TableHead>
                        <span>Anuncio</span>
                      </TableHead>
                      <TableHead>
                        <span>Monto</span>
                      </TableHead>
                      <TableHead>
                        <span>Método de Pago</span>
                      </TableHead>
                      <TableHead>
                        <span>Tipo</span>
                      </TableHead>
                      <TableHead>
                        <span>Fecha</span>
                      </TableHead>
                      <TableHead className="text-right pr-6">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium">#{order.id}</div>
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
                            {formatCurrency(
                              typeof order.amount === 'string'
                                ? parseFloat(order.amount)
                                : order.amount,
                              'CLP'
                            )}
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
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/sales/${order.id}`)}
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
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
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">No se encontraron órdenes</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="px-6 py-2">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
