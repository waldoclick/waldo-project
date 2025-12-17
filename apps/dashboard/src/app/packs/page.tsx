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
import {
  Plus,
  Edit,
  Eye,
  Package,
  Calendar,
  DollarSign,
  Clock,
  Star,
  FileText,
  Box,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { usePacks } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function PacksPage() {
  const {
    data: packs,
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
  } = usePacks();
  const router = useRouter();
  const { formatDate } = useFormatDate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const sortOptions = [
    { value: 'name:asc', label: 'Nombre A-Z' },
    { value: 'name:desc', label: 'Nombre Z-A' },
    { value: 'price:asc', label: 'Precio ascendente' },
    { value: 'price:desc', label: 'Precio descendente' },
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[{ label: 'Waldo', href: '/' }, { label: 'Packs' }]}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Box className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Packs de Anuncios
              </h1>
            </div>
            <Button size="header" onClick={() => router.push('/packs/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pack
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar packs..."
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
                        <span>Pack</span>
                      </TableHead>
                      <TableHead>
                        <span>Precio</span>
                      </TableHead>
                      <TableHead>
                        <span>Duración</span>
                      </TableHead>
                      <TableHead>
                        <span>Anuncios</span>
                      </TableHead>
                      <TableHead>
                        <span>Features</span>
                      </TableHead>
                      <TableHead>
                        <span>Fecha de Creación</span>
                      </TableHead>
                      <TableHead className="text-right pr-6">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packs.map((pack) => (
                      <TableRow key={pack.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium">#{pack.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{pack.name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {formatPrice(pack.price)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span>{pack.total_days} días</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pack.total_ads} anuncios
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span>{pack.total_features} features</span>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(pack.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/packs/${pack.id}`)}
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/packs/${pack.id}/edit`)
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

                {packs.length === 0 && !loading && (
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">No se encontraron packs</p>
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
