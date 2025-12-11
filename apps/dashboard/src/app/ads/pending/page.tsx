'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Eye,
  Link2,
  User,
  CheckCircle,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { getPendingAds, StrapiAd } from '@/lib/strapi';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePreferencesStore } from '@/stores/preferences';

export default function PendingAdsPage() {
  const { pendingAds: pendingAdsPrefs, setPendingAdsPreferences } =
    usePreferencesStore();
  const [ads, setAds] = useState<StrapiAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Cargar preferencias al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      setSearchTerm(pendingAdsPrefs.searchTerm);
      setPageSize(pendingAdsPrefs.pageSize);
      setSortBy(pendingAdsPrefs.sortBy);
      setIsInitialized(true);
    }
  }, [pendingAdsPrefs, isInitialized]);

  // Guardar preferencias cuando cambien (solo después de la inicialización)
  useEffect(() => {
    if (isInitialized) {
      setPendingAdsPreferences({
        searchTerm,
        pageSize,
        sortBy,
      });
    }
  }, [searchTerm, pageSize, sortBy, setPendingAdsPreferences, isInitialized]);

  // Reset to page 1 when search term, page size, or sort changes
  useEffect(() => {
    if (isInitialized) {
      setCurrentPage(1);
    }
  }, [searchTerm, pageSize, sortBy, isInitialized]);

  // Fetch ads when any relevant value changes
  useEffect(() => {
    // No hacer fetch hasta que las preferencias estén inicializadas
    if (!isInitialized) return;

    const fetchAds = async () => {
      try {
        setLoading(true);
        const response = await getPendingAds({
          page: currentPage,
          pageSize: pageSize,
          sort: sortBy,
          search: searchTerm || undefined,
        });
        setAds(response.data);
        setTotalPages(response.meta.pagination.pageCount);
      } catch (error) {
        console.error('Error fetching pending ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [currentPage, searchTerm, pageSize, sortBy, isInitialized]);

  const getStatusBadge = (ad: StrapiAd) => {
    if (ad.rejected) {
      return <Badge variant="destructive">Rechazado</Badge>;
    }
    if (ad.active) {
      return <Badge variant="default">Activo</Badge>;
    }
    if (!ad.reviewed) {
      // Mostrar estado de pago
      if (ad.needs_payment) {
        return <Badge variant="secondary">Pendiente de Pago</Badge>;
      } else {
        return <Badge variant="default">Pagado</Badge>;
      }
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
            <h1 className="text-3xl font-bold text-gray-900">
              Anuncios Pendientes
            </h1>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar anuncios..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {sortBy === 'createdAt:desc' && 'Más recientes'}
                      {sortBy === 'createdAt:asc' && 'Más antiguos'}
                      {sortBy === 'name:asc' && 'Título A-Z'}
                      {sortBy === 'name:desc' && 'Título Z-A'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:desc')}
                    >
                      Más recientes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:asc')}
                    >
                      Más antiguos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name:asc')}>
                      Título A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name:desc')}>
                      Título Z-A
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {pageSize} por página
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPageSize(5)}>
                      5 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(10)}>
                      10 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(25)}>
                      25 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(50)}>
                      50 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(100)}>
                      100 por página
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Cargando anuncios...</div>
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No hay anuncios pendientes</div>
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
                          <span>Estado de Pago</span>
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
                            onClick={() => router.push(`/ads/${ad.id}`)}
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
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
