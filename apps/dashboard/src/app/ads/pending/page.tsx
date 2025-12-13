'use client';

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
import { Eye, Clock } from 'lucide-react';
import { StrapiAd } from '@/lib/strapi';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useAds } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function PendingAdsPage() {
  const {
    data: ads,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    setPageSize,
    sortBy,
    setSortBy,
  } = useAds({ type: 'pending' });
  const router = useRouter();
  const { formatDate } = useFormatDate();

  interface GalleryImage {
    id?: number;
    name?: string;
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  }

  const getImageUrl = (
    image: GalleryImage | null | undefined
  ): string | null => {
    if (!image) return null;
    // Usar large o medium para mejor calidad, fallback a small, thumbnail o url original
    const url =
      image.formats?.large?.url ||
      image.formats?.medium?.url ||
      image.formats?.small?.url ||
      image.formats?.thumbnail?.url ||
      image.url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseURL =
      process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return `${baseURL}${url.startsWith('/') ? url : `/${url}`}`;
  };

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

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
    { value: 'name:asc', label: 'Título A-Z' },
    { value: 'name:desc', label: 'Título Z-A' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              Anuncios Pendientes
            </h1>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar anuncios..."
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
                        <span>Galería</span>
                      </TableHead>
                      <TableHead>
                        <span>Anuncio</span>
                      </TableHead>
                      <TableHead>
                        <span>Usuario</span>
                      </TableHead>
                      <TableHead>
                        <span>Estado de Pago</span>
                      </TableHead>
                      <TableHead>
                        <span>Fecha</span>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => {
                      const galleryImages = ad.gallery?.slice(0, 3) || [];
                      return (
                        <TableRow key={ad.id}>
                          <TableCell>
                            {galleryImages.length > 0 ? (
                              <div className="flex items-center -space-x-4">
                                {galleryImages.map((image, idx) => {
                                  const imageUrl = getImageUrl(image);
                                  if (!imageUrl) return null;
                                  return (
                                    <div
                                      key={image.id || idx}
                                      className="relative w-[45px] h-[45px] rounded-full border-2 border-white overflow-hidden bg-gray-100"
                                      style={{
                                        zIndex: galleryImages.length - idx,
                                      }}
                                    >
                                      <img
                                        src={imageUrl}
                                        alt={
                                          image.alternativeText ||
                                          image.name ||
                                          'Gallery image'
                                        }
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                  );
                                })}
                                {ad.gallery && ad.gallery.length > 3 && (
                                  <div className="relative w-[45px] h-[45px] rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 z-0">
                                    +{ad.gallery.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-[45px] h-[45px] rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400">
                                  Sin imágenes
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{ad.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {ad.user?.username}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(ad)}</TableCell>
                          <TableCell>{formatDate(ad.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/ads/${ad.id}`)}
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
