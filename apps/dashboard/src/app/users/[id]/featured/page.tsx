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
import {
  Eye,
  FileText,
  Star,
  ChevronDown,
  CheckCircle,
  Circle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StrapiAdFeaturedReservation } from '@/lib/strapi';
import { useFormatDate } from '@/hooks/useFormatDate';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Tabs } from '@/components/ui/tabs';
import { UserTabs } from '../_components/user-tabs';
import { UserHeader } from '../_components/user-header';
import { useUserFeaturedReservations } from '@/hooks/api';
import { InputSearch } from '@/components/ui/input-search';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';

export default function UserDestacadosPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const userId = params.id as string;

  const {
    data: featuredItems,
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
    filter,
    setFilter,
  } = useUserFeaturedReservations(parseInt(userId));

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
    { value: 'price:desc', label: 'Precio mayor' },
    { value: 'price:asc', label: 'Precio menor' },
  ];

  const getFeaturedStatusBadge = (featured: StrapiAdFeaturedReservation) => {
    if (featured.ad) {
      return <Badge variant="default">Usada</Badge>;
    }
    return <Badge variant="secondary">Libre</Badge>;
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
        <Tabs value="featured" className="w-full">
          <UserTabs userId={userId} />
        </Tabs>

        {/* Tabla de Destacados */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Destacados del Usuario ({totalItems})
              </CardTitle>
            </div>
            <div className="flex items-center justify-between mt-4">
              <InputSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                placeholder="Buscar en destacados..."
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-[45px] rounded-[4px] border-[#dcdcdc] bg-white text-[#313338] hover:bg-white hover:shadow-[0_0_15px_rgba(49,51,56,0.1)] flex items-center gap-2 px-4"
                    >
                      {filter === 'used'
                        ? 'Destacados Usados'
                        : 'Destacados Libres'}
                      <ChevronDown className="h-[18px] w-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setFilter('used')}
                      className={filter === 'used' ? 'bg-gray-100' : ''}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Destacados Usados
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilter('free')}
                      className={filter === 'free' ? 'bg-gray-100' : ''}
                    >
                      <Circle className="h-4 w-4 mr-2" />
                      Destacados Libres
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                        <TableHead className="pl-6">ID</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Anuncio Asociado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right pr-6">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {featuredItems.map((featured) => (
                        <TableRow key={featured.id}>
                          <TableCell className="pl-6">
                            <div className="font-medium">#{featured.id}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatPrice(featured.price, 'CLP')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getFeaturedStatusBadge(featured)}
                          </TableCell>
                          <TableCell>
                            {featured.ad ? (
                              <div>
                                <div className="font-medium">
                                  {featured.ad.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {featured.ad.id}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Sin anuncio</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(featured.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/features/${featured.id}`)
                                }
                                className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]!"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {featured.ad && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Ver anuncio asociado"
                                  onClick={() =>
                                    router.push(`/ads/${featured.ad?.id}`)
                                  }
                                  className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]!"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {featuredItems.length === 0 && !loading && (
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">
                      Este usuario no tiene destacados
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
