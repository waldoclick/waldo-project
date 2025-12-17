'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, FileText } from 'lucide-react';
import { StrapiAd } from '@/lib/strapi';
import { useFormatDate } from '@/hooks/useFormatDate';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Tabs } from '@/components/ui/tabs';
import { UserTabs } from '../_components/user-tabs';
import { UserHeader } from '../_components/user-header';
import { InputSearch } from '@/components/ui/input-search';
import { useUserAds } from '@/hooks/api';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';

export default function UserAnunciosPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const userId = params.id as string;

  const {
    data: ads,
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
  } = useUserAds(parseInt(userId));

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
    { value: 'name:asc', label: 'Nombre A-Z' },
    { value: 'name:desc', label: 'Nombre Z-A' },
    { value: 'price:desc', label: 'Precio mayor' },
    { value: 'price:asc', label: 'Precio menor' },
  ];

  const getAdStatusBadge = (ad: StrapiAd) => {
    const status = ad.status || 'unknown';

    switch (status) {
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      case 'active':
        return <Badge variant="default">Activo</Badge>;
      case 'pending':
        return <Badge variant="secondary">En Revisión</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivado</Badge>;
      default:
        return <Badge variant="secondary">En Revisión</Badge>;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'CLP' ? 'CLP' : 'USD',
    });
    return formatter.format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <UserHeader userId={userId} />

        {/* Tabs */}
        <Tabs value="ads" className="w-full">
          <UserTabs userId={userId} />
        </Tabs>

        {/* Tabla de Anuncios */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Anuncios del Usuario ({totalItems})
              </CardTitle>
            </div>
            <div className="flex items-center justify-between mt-4">
              <InputSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                placeholder="Buscar anuncios..."
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
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">
                          <span>ID</span>
                        </TableHead>
                        <TableHead>
                          <span>Nombre</span>
                        </TableHead>
                        <TableHead>
                          <span>Categoría</span>
                        </TableHead>
                        <TableHead>
                          <span>Precio</span>
                        </TableHead>
                        <TableHead>
                          <span>Estado</span>
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
                      {ads.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell className="pl-6">
                            <div className="font-medium">#{ad.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{ad.name}</div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {ad.category?.name || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatPrice(ad.price, ad.currency)}
                            </span>
                          </TableCell>
                          <TableCell>{getAdStatusBadge(ad)}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(ad.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/ads/${ad.id}`)}
                                className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]!"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {ads.length === 0 && !loading && (
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">
                      No se encontraron anuncios
                      {searchTerm && ` que coincidan con "${searchTerm}"`}
                    </p>
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
