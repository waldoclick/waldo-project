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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  ChevronDown,
} from 'lucide-react';
import { getAdPacks, StrapiAdPack } from '@/lib/strapi';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePreferencesStore } from '@/stores/preferences';

export default function PacksPage() {
  const { packs: packsPrefs, setPacksPreferences } = usePreferencesStore();
  const [packs, setPacks] = useState<StrapiAdPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('name:asc');
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Cargar preferencias al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      setSearchTerm(packsPrefs.searchTerm);
      setPageSize(packsPrefs.pageSize);
      setSortBy(packsPrefs.sortBy);
      setIsInitialized(true);
    }
  }, [packsPrefs, isInitialized]);

  // Guardar preferencias cuando cambien (solo después de la inicialización)
  useEffect(() => {
    if (isInitialized) {
      setPacksPreferences({
        searchTerm,
        pageSize,
        sortBy,
      });
    }
  }, [searchTerm, pageSize, sortBy, setPacksPreferences, isInitialized]);

  // Reset to page 1 when search term, page size, or sort changes, then fetch
  useEffect(() => {
    if (!isInitialized) return;

    setCurrentPage(1);
  }, [searchTerm, pageSize, sortBy, isInitialized]);

  // Fetch packs when any relevant value changes
  useEffect(() => {
    // No hacer fetch hasta que las preferencias estén inicializadas
    if (!isInitialized) return;

    const fetchPacks = async () => {
      try {
        setLoading(true);
        const response = await getAdPacks({
          page: currentPage,
          pageSize: pageSize,
          sort: sortBy,
          search: searchTerm || undefined,
        });

        setPacks(response.data);
        setTotalPages(response.meta.pagination.pageCount);
      } catch (error) {
        console.error('Error fetching packs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, [currentPage, searchTerm, pageSize, sortBy, isInitialized]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Packs de Anuncios
            </h1>
          </div>
          <Button onClick={() => router.push('/packs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pack
          </Button>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar packs..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {sortBy === 'name:asc' && 'Nombre A-Z'}
                      {sortBy === 'name:desc' && 'Nombre Z-A'}
                      {sortBy === 'price:asc' && 'Precio ascendente'}
                      {sortBy === 'price:desc' && 'Precio descendente'}
                      {sortBy === 'createdAt:desc' && 'Más recientes'}
                      {sortBy === 'createdAt:asc' && 'Más antiguos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('name:asc')}>
                      Nombre A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name:desc')}>
                      Nombre Z-A
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('price:asc')}>
                      Precio ascendente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('price:desc')}>
                      Precio descendente
                    </DropdownMenuItem>
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
                          <span>Pack</span>
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
                          <span>Duración</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Anuncios</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Features</span>
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
                    {packs.map((pack) => (
                      <TableRow key={pack.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pack.name}</div>
                            <div className="text-sm text-gray-500">
                              {pack.text}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/packs/${pack.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/packs/${pack.id}/edit`)
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

                {packs.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron packs</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
