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
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import {
  Eye,
  Calendar,
  DollarSign,
  Clock,
  User,
  Package,
  Star,
  Edit,
  Circle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useFeatures } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function FreeFeaturedPage() {
  const {
    data: freeFeatured,
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
  } = useFeatures({ type: 'free' });
  const router = useRouter();
  const { formatDate } = useFormatDate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
    { value: 'price:asc', label: 'Precio ascendente' },
    { value: 'price:desc', label: 'Precio descendente' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Waldo', href: '/' },
              { label: 'Destacados Libres' },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Circle className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Destacados Libres
              </h1>
            </div>
            <Button size="header" onClick={() => router.push('/features/new')}>
              <Star className="h-4 w-4 mr-2" />
              Nuevo Destacado
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar destacados..."
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
                <div className="text-gray-500">Cargando destacados...</div>
              </div>
            ) : freeFeatured.length === 0 ? (
              <div className="text-center py-8 px-5">
                <div className="text-gray-500">No hay destacados libres</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">
                        <span>ID</span>
                      </TableHead>
                      <TableHead>
                        <span>Usuario</span>
                      </TableHead>
                      <TableHead>
                        <span>Anuncio</span>
                      </TableHead>
                      <TableHead>
                        <span>Precio</span>
                      </TableHead>
                      <TableHead>
                        <span>Días</span>
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
                    {freeFeatured.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium">#{reservation.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {reservation.user?.username || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {reservation.ad?.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatPrice(reservation.price)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span>{reservation.total_days || 'N/A'} días</span>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(reservation.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/features/${reservation.id}`)
                              }
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/features/${reservation.id}/edit`)
                              }
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
