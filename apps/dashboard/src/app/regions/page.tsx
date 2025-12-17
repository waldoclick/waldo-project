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
  MapPin,
  Calendar,
  Hash,
  Building,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useRegions } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function RegionsPage() {
  const {
    data: regions,
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
  } = useRegions();
  const router = useRouter();
  const { formatDate } = useFormatDate();

  const sortOptions = [
    { value: 'name:asc', label: 'Nombre A-Z' },
    { value: 'name:desc', label: 'Nombre Z-A' },
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[{ label: 'Waldo', href: '/' }, { label: 'Regiones' }]}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Regiones
              </h1>
            </div>
            <Button size="header" onClick={() => router.push('/regions/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Región
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar regiones..."
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
                        <span>Región</span>
                      </TableHead>
                      <TableHead>
                        <span>Slug</span>
                      </TableHead>
                      <TableHead>
                        <span>Comunas</span>
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
                    {regions.map((region) => (
                      <TableRow key={region.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium">#{region.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{region.name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {region.slug.length > 20
                              ? `${region.slug.substring(0, 20)}...`
                              : region.slug}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {region.communes?.length || 0} comunas
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(region.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/regions/${region.id}`)
                              }
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/regions/${region.id}/edit`)
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

                {regions.length === 0 && !loading && (
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">No se encontraron regiones</p>
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
