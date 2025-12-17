'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, FileText, Star, CheckCircle, Circle } from 'lucide-react';
import {
  getUserFeaturedReservations,
  StrapiAdFeaturedReservation,
} from '@/lib/strapi';
import { useFormatDate } from '@/hooks/useFormatDate';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import { UserTabs } from '../_components/user-tabs';
import { UserHeader } from '../_components/user-header';

export default function UserDestacadosPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [userFeatured, setUserFeatured] = useState<
    StrapiAdFeaturedReservation[]
  >([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(1);
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);
  const [featuredFilter, setFeaturedFilter] = useState<'used' | 'free'>('used');

  const userId = params.id as string;

  const fetchUserFeatured = useCallback(async () => {
    if (!userId) return;

    try {
      setFeaturedLoading(true);
      const params = {
        page: 1,
        pageSize: 1000,
        sort: 'createdAt:desc',
      };
      const response = await getUserFeaturedReservations(
        parseInt(userId),
        params
      );

      setUserFeatured(response.data);
      setFeaturedLoading(false);
    } catch (error) {
      console.error('Error fetching user featured reservations:', error);
      if (error instanceof Error && error.message.includes('403')) {
        console.warn(
          'Endpoint ad-featured-reservations no configurado o sin permisos'
        );
      }
      setUserFeatured([]);
      setFeaturedLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserFeatured();
  }, [fetchUserFeatured]);

  useEffect(() => {
    setFeaturedCurrentPage(1);
  }, [featuredFilter]);

  const handleFeaturedPageChange = (newPage: number) => {
    setFeaturedCurrentPage(newPage);
  };

  const getFeaturedStatusBadge = (featured: StrapiAdFeaturedReservation) => {
    if (featured.ad) {
      return <Badge variant="default">Usada</Badge>;
    }
    return <Badge variant="secondary">Libre</Badge>;
  };

  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'CLP' ? 'CLP' : 'USD',
    });
    return formatter.format(price);
  };

  const filteredFeatured = userFeatured.filter((f) =>
    featuredFilter === 'used' ? f.ad : !f.ad
  );
  const pageSize = 10;
  const totalFilteredPages = Math.ceil(filteredFeatured.length / pageSize);
  const startIndex = (featuredCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Actualizar totalFilteredItems si cambió
  useEffect(() => {
    setTotalFilteredItems(filteredFeatured.length);
  }, [filteredFeatured.length]);

  const paginatedFeatured = filteredFeatured.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <UserHeader userId={userId} />

        {/* Tabs */}
        <Tabs value="featured" className="w-full">
          <UserTabs userId={userId} />
        </Tabs>

        {/* Tabla de Destacados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Destacados del Usuario ({filteredFeatured.length})
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    {featuredFilter === 'used'
                      ? 'Destacados Usados'
                      : 'Destacados Libres'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setFeaturedFilter('used')}
                    className={featuredFilter === 'used' ? 'bg-gray-100' : ''}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Destacados Usados
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFeaturedFilter('free')}
                    className={featuredFilter === 'free' ? 'bg-gray-100' : ''}
                  >
                    <Circle className="h-4 w-4 mr-2" />
                    Destacados Libres
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {filteredFeatured.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">ID</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Anuncio Asociado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right pr-6">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedFeatured.map((featured) => (
                        <TableRow key={featured.id}>
                          <TableCell className="pl-6">
                            <div className="font-medium">#{featured.id}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatPrice(featured.price, 'CLP')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getFeaturedStatusBadge(featured)}
                          </TableCell>
                          <TableCell>
                            {featured.ad ? (
                              <div>
                                <div className="font-medium">
                                  {featured.ad.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {featured.ad.id}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Sin anuncio</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(featured.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Link href={`/features/${featured.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699] hover:!bg-[#ffd699] [&:hover]:bg-[#ffd699]"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {featured.ad && (
                                <Link href={`/ads/${featured.ad.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Ver anuncio asociado"
                                    className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699] hover:!bg-[#ffd699] [&:hover]:bg-[#ffd699]"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                <CardFooter className="px-6 py-2">
                  <DataTablePagination
                    currentPage={featuredCurrentPage}
                    totalPages={totalFilteredPages}
                    totalItems={totalFilteredItems}
                    onPageChange={handleFeaturedPageChange}
                  />
                </CardFooter>
              </>
            ) : (
              <div className="text-center py-8 px-5">
                <p className="text-gray-500">
                  Este usuario no tiene{' '}
                  {featuredFilter === 'used'
                    ? 'destacados usados'
                    : 'destacados libres'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
