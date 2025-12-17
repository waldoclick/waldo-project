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
import { Eye, FileText, Calendar, CheckCircle, Circle } from 'lucide-react';
import { getUserReservations, StrapiAdReservation } from '@/lib/strapi';
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

export default function UserReservasPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [userReservations, setUserReservations] = useState<
    StrapiAdReservation[]
  >([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsCurrentPage, setReservationsCurrentPage] = useState(1);
  const [reservationFilter, setReservationFilter] = useState<'used' | 'free'>(
    'used'
  );

  const userId = params.id as string;

  const fetchUserReservations = useCallback(async () => {
    if (!userId) return;

    try {
      setReservationsLoading(true);
      const params = {
        page: 1,
        pageSize: 1000,
        sort: 'createdAt:desc',
      };
      const response = await getUserReservations(parseInt(userId), params);

      setUserReservations(response.data);
      setReservationsLoading(false);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      setReservationsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations]);

  useEffect(() => {
    setReservationsCurrentPage(1);
  }, [reservationFilter]);

  const handleReservationsPageChange = (newPage: number) => {
    setReservationsCurrentPage(newPage);
  };

  const getReservationStatusBadge = (reservation: StrapiAdReservation) => {
    if (reservation.ad) {
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

  const filteredReservations = userReservations.filter((r) =>
    reservationFilter === 'used' ? r.ad : !r.ad
  );
  const pageSize = 10;
  const totalFilteredPages = Math.ceil(filteredReservations.length / pageSize);
  const startIndex = (reservationsCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    endIndex
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <UserHeader userId={userId} />

        {/* Tabs */}
        <Tabs value="reservations" className="w-full">
          <UserTabs userId={userId} />
        </Tabs>

        {/* Tabla de Reservas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Reservas del Usuario ({filteredReservations.length})
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    {reservationFilter === 'used'
                      ? 'Reservas Usadas'
                      : 'Reservas Libres'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setReservationFilter('used')}
                    className={
                      reservationFilter === 'used' ? 'bg-gray-100' : ''
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reservas Usadas
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setReservationFilter('free')}
                    className={
                      reservationFilter === 'free' ? 'bg-gray-100' : ''
                    }
                  >
                    <Circle className="h-4 w-4 mr-2" />
                    Reservas Libres
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {filteredReservations.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">
                          <span># ID</span>
                        </TableHead>
                        <TableHead>
                          <span>$ Precio</span>
                        </TableHead>
                        <TableHead>
                          <span>Estado</span>
                        </TableHead>
                        <TableHead>
                          <span>Anuncio Asociado</span>
                        </TableHead>
                        <TableHead>
                          <span>Días</span>
                        </TableHead>
                        <TableHead>
                          <span>Fecha</span>
                        </TableHead>
                        <TableHead className="text-right pr-6">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="pl-6">
                            <div className="font-medium">#{reservation.id}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatPrice(reservation.price, 'CLP')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getReservationStatusBadge(reservation)}
                          </TableCell>
                          <TableCell>
                            {reservation.ad ? (
                              <div>
                                <div className="font-medium">
                                  {reservation.ad.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {reservation.ad.id}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Sin anuncio</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {reservation.total_days || '-'} días
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(reservation.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Link href={`/reservations/${reservation.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699] hover:!bg-[#ffd699] [&:hover]:bg-[#ffd699]"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {reservation.ad && (
                                <Link href={`/ads/${reservation.ad.id}`}>
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
                <CardFooter className="px-6 py-4">
                  <DataTablePagination
                    currentPage={reservationsCurrentPage}
                    totalPages={totalFilteredPages}
                    onPageChange={handleReservationsPageChange}
                  />
                </CardFooter>
              </>
            ) : (
              <div className="text-center py-8 px-5">
                <p className="text-gray-500">
                  Este usuario no tiene{' '}
                  {reservationFilter === 'used'
                    ? 'reservas usadas'
                    : 'reservas libres'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
