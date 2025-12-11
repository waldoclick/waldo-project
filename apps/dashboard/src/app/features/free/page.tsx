'use client';

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Eye,
  Calendar,
  DollarSign,
  Clock,
  User,
  Package,
  Star,
  Edit,
  ChevronDown,
} from 'lucide-react';
import {
  getFreeFeaturedReservations,
  StrapiAdFeaturedReservation,
} from '@/lib/strapi';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePreferencesStore } from '@/stores/preferences';

export default function FreeFeaturedPage() {
  const { freeFeatures: freeFeaturesPrefs, setFreeFeaturesPreferences } =
    usePreferencesStore();
  const [freeFeatured, setFreeFeatured] = useState<
    StrapiAdFeaturedReservation[]
  >([]);
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
      setSearchTerm(freeFeaturesPrefs.searchTerm);
      setPageSize(freeFeaturesPrefs.pageSize);
      setSortBy(freeFeaturesPrefs.sortBy);
      setIsInitialized(true);
    }
  }, [freeFeaturesPrefs, isInitialized]);

  // Guardar preferencias cuando cambien (solo después de la inicialización)
  useEffect(() => {
    if (isInitialized) {
      setFreeFeaturesPreferences({
        searchTerm,
        pageSize,
        sortBy,
      });
    }
  }, [searchTerm, pageSize, sortBy, setFreeFeaturesPreferences, isInitialized]);

  // Reset to page 1 when search term, page size, or sort changes, then fetch
  useEffect(() => {
    if (!isInitialized) return;

    setCurrentPage(1);
  }, [searchTerm, pageSize, sortBy, isInitialized]);

  // Fetch featured when any relevant value changes
  useEffect(() => {
    // No hacer fetch hasta que las preferencias estén inicializadas
    if (!isInitialized) return;

    const fetchFreeFeatured = async () => {
      try {
        setLoading(true);
        const response = await getFreeFeaturedReservations({
          page: currentPage,
          pageSize: pageSize,
          sort: sortBy,
          search: searchTerm || undefined,
        });
        setFreeFeatured(response.data);
        setTotalPages(response.meta.pagination.pageCount);
      } catch (error) {
        console.error('Error fetching free featured:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeFeatured();
  }, [currentPage, searchTerm, pageSize, sortBy, isInitialized]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Destacados Libres
            </h1>
          </div>
          <Button onClick={() => router.push('/features/new')}>
            <Star className="h-4 w-4 mr-2" />
            Nuevo Destacado
          </Button>
        </div>

        {/* Table */}
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar destacados..."
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
                      {sortBy === 'price:asc' && 'Precio ascendente'}
                      {sortBy === 'price:desc' && 'Precio descendente'}
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
                    <DropdownMenuItem onClick={() => setSortBy('price:asc')}>
                      Precio ascendente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('price:desc')}>
                      Precio descendente
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
                <div className="text-gray-500">Cargando destacados...</div>
              </div>
            ) : freeFeatured.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No hay destacados libres</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Usuario</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>Anuncio</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Precio</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Días</span>
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
                    {freeFeatured.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.user?.username || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.user?.email || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.ad?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.ad?.description?.substring(0, 30)}...
                            </div>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/features/${reservation.id}`)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/features/${reservation.id}/edit`)
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
