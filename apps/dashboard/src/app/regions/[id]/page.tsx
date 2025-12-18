'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { InfoField } from '@/components/ui/info-field';
import { InputSearch } from '@/components/ui/input-search';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, MapPin, Info, Eye, Building } from 'lucide-react';
import { getRegion } from '@/lib/strapi/regions';
import { StrapiRegion } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useRegionCommunes } from '@/hooks/api';

export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [region, setRegion] = useState<StrapiRegion | null>(null);
  const [loading, setLoading] = useState(true);

  const regionId = params.id as string;

  const {
    data: communes,
    loading: communesLoading,
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
  } = useRegionCommunes(parseInt(regionId));

  const sortOptions = [
    { value: 'name:asc', label: 'Nombre A-Z' },
    { value: 'name:desc', label: 'Nombre Z-A' },
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
  ];

  const fetchRegion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRegion(parseInt(regionId));
      setRegion(response.data);
    } catch (error) {
      console.error('Error fetching region:', error);
      alert('Error al cargar la región');
      router.push('/regions');
    } finally {
      setLoading(false);
    }
  }, [regionId, router]);

  useEffect(() => {
    fetchRegion();
  }, [fetchRegion]);

  const { formatDate } = useFormatDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Región no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Waldo', href: '/' },
              { label: 'Regiones', href: '/regions' },
              { label: region.name },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                {region.name}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button
                size="header"
                onClick={() => router.push(`/regions/${region.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Información de la Región
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={region.id} />
                  <InfoField label="Nombre" value={region.name} />
                  <InfoField label="Slug" value={region.slug} />
                  <InfoField
                    label="Comunas"
                    value={`${region.communes?.length || 0} comunas`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField
                  label="Creado"
                  value={formatDate(region.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(region.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de comunas - Ancho completo */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 mr-2" />
              <CardTitle>
                Comunas de {region.name} ({totalItems})
              </CardTitle>
            </div>
            <div className="flex items-center justify-between mt-4">
              <InputSearch
                placeholder="Buscar comunas..."
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
            {communesLoading ? (
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
                          <span>Comuna</span>
                        </TableHead>
                        <TableHead>
                          <span>Slug</span>
                        </TableHead>
                        <TableHead>
                          <span>Región</span>
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
                      {communes.map((commune) => (
                        <TableRow key={commune.id}>
                          <TableCell className="pl-6">
                            <div className="font-medium">#{commune.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{commune.name}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {commune.slug}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {commune.region?.name || region.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(commune.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/communes/${commune.id}`)
                                }
                                className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/communes/${commune.id}/edit`)
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

                {communes.length === 0 && !communesLoading && (
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">No se encontraron comunas</p>
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
