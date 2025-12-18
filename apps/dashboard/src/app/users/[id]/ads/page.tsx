'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  List,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserAds, StrapiAd } from '@/lib/strapi';
import { useFormatDate } from '@/hooks/useFormatDate';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Tabs } from '@/components/ui/tabs';
import { UserTabs } from '../_components/user-tabs';
import { UserHeader } from '../_components/user-header';
import { InputSearch } from '@/components/ui/input-search';

export default function UserAnunciosPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [userAds, setUserAds] = useState<StrapiAd[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsCurrentPage, setAdsCurrentPage] = useState(1);
  const [adsStatusFilter, setAdsStatusFilter] = useState<
    'all' | 'active' | 'rejected' | 'pending'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  const userId = params.id as string;

  const fetchUserAds = useCallback(async () => {
    if (!userId) return;

    try {
      setAdsLoading(true);
      // Obtener todos los anuncios de una vez para poder filtrar localmente
      const params = {
        page: 1,
        pageSize: 1000,
        sort: 'createdAt:desc',
      };
      const response = await getUserAds(parseInt(userId), params);

      setUserAds(response.data);
      setAdsLoading(false);
    } catch (error) {
      console.error('Error fetching user ads:', error);
      setAdsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserAds();
  }, [fetchUserAds]);

  // Resetear a página 1 cuando cambia el filtro o la búsqueda
  useEffect(() => {
    setAdsCurrentPage(1);
  }, [adsStatusFilter, searchTerm]);

  const handleAdsPageChange = (newPage: number) => {
    setAdsCurrentPage(newPage);
  };

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

  const getAdStatus = (ad: StrapiAd): 'active' | 'rejected' | 'pending' => {
    // Usar el status del backend directamente
    const status = ad.status;
    if (status === 'rejected' || status === 'active' || status === 'pending') {
      return status;
    }
    // Fallback solo si no viene el status del backend
    if (ad.rejected) return 'rejected';
    if (ad.active) return 'active';
    return 'pending';
  };

  const getStatusLabel = (
    status: 'all' | 'active' | 'rejected' | 'pending'
  ) => {
    switch (status) {
      case 'all':
        return 'Todos';
      case 'active':
        return 'Activos';
      case 'rejected':
        return 'Rechazados';
      case 'pending':
        return 'En Revisión';
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Anuncios del Usuario (
                {
                  userAds.filter((ad) => {
                    // Filtro por estado - usar ad.status directamente
                    if (adsStatusFilter !== 'all') {
                      const adStatus = ad.status;
                      if (
                        adStatus &&
                        adStatus !== adsStatusFilter &&
                        adStatus !== 'archived'
                      ) {
                        return false;
                      }
                      // Si no tiene status, usar getAdStatus como fallback
                      if (!adStatus && getAdStatus(ad) !== adsStatusFilter) {
                        return false;
                      }
                    }
                    // Filtro por búsqueda
                    if (
                      searchTerm &&
                      !ad.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    ) {
                      return false;
                    }
                    return true;
                  }).length
                }
                )
              </CardTitle>
              <div className="flex items-center gap-3">
                <InputSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar anuncios..."
                  className="w-64"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 h-[42px] px-4 bg-white border border-[#EAEBEB] rounded-[4px] text-[14px] text-[#313338] transition-all hover:shadow-[0_0_30px_rgba(49,51,56,0.1)] outline-none">
                      {getStatusLabel(adsStatusFilter)}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setAdsStatusFilter('all')}
                      className={adsStatusFilter === 'all' ? 'bg-gray-100' : ''}
                    >
                      <List className="h-4 w-4 mr-2" />
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAdsStatusFilter('active')}
                      className={
                        adsStatusFilter === 'active' ? 'bg-gray-100' : ''
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAdsStatusFilter('rejected')}
                      className={
                        adsStatusFilter === 'rejected' ? 'bg-gray-100' : ''
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazados
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAdsStatusFilter('pending')}
                      className={
                        adsStatusFilter === 'pending' ? 'bg-gray-100' : ''
                      }
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      En Revisión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {(() => {
              const filteredAds = userAds.filter((ad) => {
                // Filtro por estado - usar ad.status directamente
                if (adsStatusFilter !== 'all') {
                  const adStatus = ad.status;
                  if (
                    adStatus &&
                    adStatus !== adsStatusFilter &&
                    adStatus !== 'archived'
                  ) {
                    return false;
                  }
                  // Si no tiene status, usar getAdStatus como fallback
                  if (!adStatus && getAdStatus(ad) !== adsStatusFilter) {
                    return false;
                  }
                }
                // Filtro por búsqueda
                if (
                  searchTerm &&
                  !ad.name?.toLowerCase().includes(searchTerm.toLowerCase())
                ) {
                  return false;
                }
                return true;
              });
              const pageSize = 10;
              const totalFilteredPages = Math.ceil(
                filteredAds.length / pageSize
              );
              const startIndex = (adsCurrentPage - 1) * pageSize;
              const endIndex = startIndex + pageSize;
              const paginatedAds = filteredAds.slice(startIndex, endIndex);

              return filteredAds.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>
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
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAds.map((ad) => (
                          <TableRow key={ad.id}>
                            <TableCell>
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
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Link href={`/ads/${ad.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]!"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  {totalFilteredPages > 1 && (
                    <div className="mt-4 px-5">
                      <DataTablePagination
                        currentPage={adsCurrentPage}
                        totalPages={totalFilteredPages}
                        onPageChange={handleAdsPageChange}
                      />
                    </div>
                  )}
                </>
              ) : userAds.length === 0 ? (
                <div className="text-center py-8 px-5">
                  <p className="text-gray-500">
                    Este usuario no tiene anuncios publicados
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 px-5">
                  <p className="text-gray-500">
                    No se encontraron anuncios
                    {searchTerm && ` que coincidan con "${searchTerm}"`}
                    {adsStatusFilter !== 'all' &&
                      ` con estado "${getStatusLabel(adsStatusFilter).toLowerCase()}"`}
                  </p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
