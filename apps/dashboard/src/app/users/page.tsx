'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Plus, Eye, User } from 'lucide-react';
import { getUsers, StrapiUser } from '@/lib/strapi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function UsersPage() {
  const [users, setUsers] = useState<StrapiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalUsers] = useState(0);
  const router = useRouter();
  const { formatDate } = useFormatDate();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: currentPage,
        pageSize: 25,
        sort: 'createdAt:desc',
        search: searchTerm || undefined,
      });

      setUsers(response.data);
      setTotalPages(response.meta.pagination.pageCount);
      setTotalItems(response.meta.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadge = (user: StrapiUser) => {
    if (user.blocked) {
      return <Badge variant="destructive">Bloqueado</Badge>;
    }
    if (user.confirmed) {
      return <Badge variant="default">Confirmado</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  const getAdsCount = (user: StrapiUser): number => {
    return user.ads?.length || 0;
  };

  const getFreeReservationsCount = (user: StrapiUser): number => {
    if (!user.ad_reservations) return 0;
    return user.ad_reservations.filter((reservation) => !reservation.ad).length;
  };

  const getFreeFeaturedReservationsCount = (user: StrapiUser): number => {
    if (!user.ad_featured_reservations) return 0;
    return user.ad_featured_reservations.filter(
      (reservation) => !reservation.ad
    ).length;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[{ label: 'Waldo', href: '/' }, { label: 'Usuarios' }]}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Usuarios
              </h1>
            </div>
            <Button className="hidden">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Usuarios</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="flex items-center justify-center py-8 px-5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">
                        <span>ID</span>
                      </TableHead>
                      <TableHead>
                        <span>Usuario</span>
                      </TableHead>
                      <TableHead>
                        <span>Email</span>
                      </TableHead>
                      <TableHead>
                        <span>Estado</span>
                      </TableHead>
                      <TableHead>
                        <span>Anuncios</span>
                      </TableHead>
                      <TableHead>
                        <span>Reservas</span>
                      </TableHead>
                      <TableHead>
                        <span>Destacados</span>
                      </TableHead>
                      <TableHead>
                        <span>Registro</span>
                      </TableHead>
                      <TableHead className="text-right pr-6">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium">#{user.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            <Link
                              href={`/users/${user.id}`}
                              className="hover:underline cursor-pointer"
                            >
                              {user.username}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>{user.email}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {getAdsCount(user)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {getFreeReservationsCount(user)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {getFreeFeaturedReservationsCount(user)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(user.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/users/${user.id}`)}
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {users.length === 0 && !loading && (
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">No se encontraron usuarios</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="px-6 py-2">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
                {totalItems > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({totalItems} {totalItems === 1 ? 'usuario' : 'usuarios'})
                  </span>
                )}
              </div>
              {totalPages > 1 && (
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
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
