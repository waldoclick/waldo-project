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
import { Eye, Link2, User, CheckCircle, Calendar } from 'lucide-react';
import { getActiveAds, StrapiAd } from '@/lib/strapi';
import { useRouter } from 'next/navigation';

export default function ActiveAdsPage() {
  const [ads, setAds] = useState<StrapiAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getActiveAds({
        page: currentPage,
        pageSize: 25,
        sort: 'createdAt:desc',
        search: searchTerm || undefined,
      });
      setAds(response.data);
      setTotalPages(response.meta.pagination.pageCount);
    } catch (error) {
      console.error('Error fetching active ads:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (ad: StrapiAd) => {
    if (ad.rejected) {
      return <Badge variant="destructive">Rechazado</Badge>;
    }
    if (ad.active) {
      return <Badge variant="default">Activo</Badge>;
    }
    if (!ad.reviewed) {
      return <Badge variant="secondary">Pendiente</Badge>;
    }
    return <Badge variant="outline">Archivado</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Anuncios Activos
            </h1>
            <p className="text-gray-500">
              Gestiona los anuncios que están actualmente publicados
            </p>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Anuncios Activos</CardTitle>
              <Input
                placeholder="Buscar anuncios..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Cargando anuncios...</div>
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No hay anuncios activos</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Link2 className="h-4 w-4" />
                          <span>Anuncio</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Usuario</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Estado</span>
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
                    {ads.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ad.name}</div>
                            <div className="text-sm text-gray-500">
                              {ad.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {ad.user?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ad.user?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(ad)}</TableCell>
                        <TableCell>{formatDate(ad.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/ads/${ad.id}`)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
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
