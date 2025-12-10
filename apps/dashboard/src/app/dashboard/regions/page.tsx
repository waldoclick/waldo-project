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
  Plus,
  Edit,
  Eye,
  MapPin,
  Calendar,
  Hash,
  Building,
} from 'lucide-react';
import { getRegions, StrapiRegion } from '@/lib/strapi';
import { useRouter } from 'next/navigation';

export default function RegionsPage() {
  const [regions, setRegions] = useState<StrapiRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchRegions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRegions({
        page: currentPage,
        pageSize: 25,
        sort: 'name:asc',
        search: searchTerm || undefined,
      });

      console.log('Regions response:', response);
      setRegions(response.data);
      setTotalPages(response.meta.pagination.pageCount);
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Regiones</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las regiones del sistema
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/regions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Región
          </Button>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Regiones</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar regiones..."
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
                          <MapPin className="h-4 w-4" />
                          <span>Región</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4" />
                          <span>Slug</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Comunas</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Fecha de Creación</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.map((region) => (
                      <TableRow key={region.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{region.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {region.id}
                            </div>
                          </div>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/regions/${region.id}`)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/regions/${region.id}/edit`
                                )
                              }
                              className="h-8 w-8 p-0"
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
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron regiones</p>
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
