'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Edit, Calendar, Hash, Package } from 'lucide-react';
import { getConditions } from '@/lib/strapi/conditions';
import { StrapiCondition } from '@/lib/strapi/types';

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<StrapiCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchConditions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getConditions({
        page: currentPage,
        pageSize: 25,
        sort: 'name:asc',
        search: searchTerm || undefined,
      });

      console.log('Conditions response:', response);
      setConditions(response.data);
      setTotalPages(response.meta.pagination.pageCount);
    } catch (error) {
      console.error('Error fetching conditions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchConditions();
  }, [fetchConditions]);

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Condiciones</h1>
            <p className="text-gray-500">
              Gestiona las condiciones de los productos
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/conditions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Condición
          </Button>
        </div>

        {/* Tabla */}
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Condiciones</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar condiciones..."
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
                          <Package className="h-4 w-4" />
                          <span>Condición</span>
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
                          <Calendar className="h-4 w-4" />
                          <span>Fecha de Creación</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conditions.map((condition) => (
                      <TableRow key={condition.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{condition.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {condition.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {condition.slug}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(condition.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/conditions/${condition.id}`
                                )
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
                                  `/dashboard/conditions/${condition.id}/edit`
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

                {conditions.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No se encontraron condiciones
                    </p>
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
