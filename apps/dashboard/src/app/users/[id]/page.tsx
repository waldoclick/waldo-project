'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonViewerButton } from '@/components/ui/json-viewer-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  User,
  Shield,
  ExternalLink,
  Building2,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Star,
  Package,
  Tag,
  CheckCircle,
  Hash,
  Clock,
  Info,
} from 'lucide-react';
import {
  getUser,
  StrapiUser,
  getUserAds,
  StrapiAd,
  getUserReservations,
  StrapiAdReservation,
  getUserFeaturedReservations,
  StrapiAdFeaturedReservation,
} from '@/lib/strapi';
import { useFormatDate } from '@/hooks/useFormatDate';
import { InfoField } from '@/components/ui/info-field';
import { CustomButton } from '@/components/ui/custom-button';

// Interfaz extendida para el usuario con campos adicionales
interface ExtendedStrapiUser extends StrapiUser {
  firstname?: string;
  lastname?: string;
  rut?: string;
  phone?: string;
  birthdate?: string;
  pro?: boolean;
  is_company?: boolean;
  address?: string;
  address_number?: number;
  postal_code?: string;
  last_username_change?: string;
  business_name?: string;
  business_type?: string;
  business_rut?: string;
  business_address?: string;
  business_address_number?: number;
  business_postal_code?: string;
  commune?: {
    id: number;
    name: string;
    region?: {
      id: number;
      name: string;
    };
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [user, setUser] = useState<ExtendedStrapiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAds, setUserAds] = useState<StrapiAd[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsCurrentPage, setAdsCurrentPage] = useState(1);
  const [adsTotalPages, setAdsTotalPages] = useState(1);
  const [adsTotalCount, setAdsTotalCount] = useState(0);
  const [userReservations, setUserReservations] = useState<
    StrapiAdReservation[]
  >([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsCurrentPage, setReservationsCurrentPage] = useState(1);
  const [reservationsTotalPages, setReservationsTotalPages] = useState(1);
  const [reservationsTotalCount, setReservationsTotalCount] = useState(0);
  const [userFeatured, setUserFeatured] = useState<
    StrapiAdFeaturedReservation[]
  >([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(1);
  const [featuredTotalPages, setFeaturedTotalPages] = useState(1);
  const [featuredTotalCount, setFeaturedTotalCount] = useState(0);

  const userId = params.id as string;

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUser(parseInt(userId));

      console.log('User detail response:', response);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserAds = useCallback(async () => {
    if (!userId) return;

    try {
      setAdsLoading(true);
      const params = {
        page: adsCurrentPage,
        pageSize: 5,
        sort: 'createdAt:desc',
      };
      console.log('Calling getUserAds with params:', params);
      const response = await getUserAds(parseInt(userId), params);

      // Solo actualizar los datos cuando la respuesta sea exitosa
      setUserAds(response.data);
      setAdsTotalPages(response.meta.pagination.pageCount);
      setAdsTotalCount(response.meta.pagination.total);
      setAdsLoading(false);
    } catch (error) {
      console.error('Error fetching user ads:', error);
      setAdsLoading(false);
    }
  }, [userId, adsCurrentPage]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchUserReservations = useCallback(async () => {
    if (!userId) return;

    try {
      setReservationsLoading(true);
      const params = {
        page: reservationsCurrentPage,
        pageSize: 5,
        sort: 'createdAt:desc',
      };
      console.log('Calling getUserReservations with params:', params);
      const response = await getUserReservations(parseInt(userId), params);

      // Solo actualizar los datos cuando la respuesta sea exitosa
      setUserReservations(response.data);
      setReservationsTotalPages(response.meta.pagination.pageCount);
      setReservationsTotalCount(response.meta.pagination.total);
      setReservationsLoading(false);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      setReservationsLoading(false);
    }
  }, [userId, reservationsCurrentPage]);

  const fetchUserFeatured = useCallback(async () => {
    if (!userId) return;

    try {
      setFeaturedLoading(true);
      const params = {
        page: featuredCurrentPage,
        pageSize: 5,
        sort: 'createdAt:desc',
      };
      console.log('Calling getUserFeaturedReservations with params:', params);
      const response = await getUserFeaturedReservations(
        parseInt(userId),
        params
      );

      // Solo actualizar los datos cuando la respuesta sea exitosa
      setUserFeatured(response.data);
      setFeaturedTotalPages(response.meta.pagination.pageCount);
      setFeaturedTotalCount(response.meta.pagination.total);
      setFeaturedLoading(false);
    } catch (error) {
      console.error('Error fetching user featured reservations:', error);
      // Si es error 403, mostrar mensaje específico
      if (error instanceof Error && error.message.includes('403')) {
        console.warn(
          'Endpoint ad-featured-reservations no configurado o sin permisos'
        );
      }
      setUserFeatured([]);
      setFeaturedTotalCount(0);
      setFeaturedLoading(false);
    }
  }, [userId, featuredCurrentPage]);

  useEffect(() => {
    if (user) {
      fetchUserAds();
    }
  }, [user, fetchUserAds]);

  useEffect(() => {
    if (user) {
      fetchUserReservations();
    }
  }, [user, fetchUserReservations]);

  useEffect(() => {
    if (user) {
      fetchUserFeatured();
    }
  }, [user, fetchUserFeatured]);

  const getStatusBadge = (user: ExtendedStrapiUser) => {
    if (user.blocked) {
      return <Badge variant="destructive">Bloqueado</Badge>;
    }
    if (user.confirmed) {
      return <Badge variant="default">Confirmado</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  const handleAdsPageChange = (newPage: number) => {
    setAdsCurrentPage(newPage);
  };

  const handleReservationsPageChange = (newPage: number) => {
    setReservationsCurrentPage(newPage);
  };

  const handleFeaturedPageChange = (newPage: number) => {
    setFeaturedCurrentPage(newPage);
  };

  const getReservationStatusBadge = (reservation: StrapiAdReservation) => {
    if (reservation.ad) {
      return <Badge variant="default">Usada</Badge>;
    }
    return <Badge variant="secondary">Libre</Badge>;
  };

  const getFeaturedStatusBadge = (featured: StrapiAdFeaturedReservation) => {
    if (featured.ad) {
      return <Badge variant="default">Usada</Badge>;
    }
    return <Badge variant="secondary">Libre</Badge>;
  };

  const getAdStatusBadge = (ad: StrapiAd) => {
    if (ad.rejected) {
      return <Badge variant="destructive">Rechazado</Badge>;
    }
    if (ad.active) {
      return <Badge variant="default">Activo</Badge>;
    }
    return <Badge variant="secondary">En Revisión</Badge>;
  };

  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'CLP' ? 'CLP' : 'USD',
    });
    return formatter.format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Usuario no encontrado'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              {user.username}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <JsonViewerButton
              data={user}
              title={`JSON del Usuario: ${user.username}`}
              buttonText="Ver JSON"
              buttonVariant="outline"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Nombre de Usuario" value={user.username} />
                  <InfoField label="Email" value={user.email} type="email" />
                  <InfoField label="Nombre" value={user.firstname} />
                  <InfoField label="Apellido" value={user.lastname} />
                  <InfoField label="RUT" value={user.rut} />
                  <InfoField label="Teléfono" value={user.phone} type="phone" />
                  <InfoField
                    label="Fecha de Nacimiento"
                    value={user.birthdate ? formatDate(user.birthdate) : null}
                  />
                  <InfoField
                    label="Usuario PRO"
                    value={user.pro ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Dirección"
                    value={
                      user.address && user.address_number && user.commune?.name
                        ? `${user.address} ${user.address_number}, ${user.commune.name}`
                        : user.address && user.commune?.name
                          ? `${user.address}, ${user.commune.name}`
                          : `${user.address || ''}${user.address && user.address_number ? ' ' : ''}${user.address_number || ''}${(user.address || user.address_number) && user.commune?.name ? ', ' : ''}${user.commune?.name || ''}` ||
                            null
                    }
                  />
                  <InfoField label="Código Postal" value={user.postal_code} />
                  <InfoField label="Comuna" value={user.commune?.name} />
                  <InfoField
                    label="Región"
                    value={user.commune?.region?.name}
                  />
                  <InfoField label="Proveedor" value={user.provider} />
                  <InfoField label="ID" value={user.id} />
                  <InfoField
                    label="Último cambio de usuario"
                    value={
                      user.last_username_change
                        ? formatDate(user.last_username_change)
                        : null
                    }
                  />
                  <div>
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: '#313338' }}
                    >
                      Estado
                    </label>
                    <div className="mt-1">{getStatusBadge(user)}</div>
                  </div>
                  <InfoField
                    label="Confirmado"
                    value={user.confirmed ? 'Sí' : 'No'}
                  />
                  <InfoField
                    label="Bloqueado"
                    value={user.blocked ? 'Sí' : 'No'}
                  />
                  {user.is_company && (
                    <>
                      <InfoField
                        label="Nombre de la Empresa"
                        value={user.business_name}
                      />
                      <InfoField
                        label="RUT de la Empresa"
                        value={user.business_rut}
                      />
                      <InfoField
                        label="Tipo de Empresa"
                        value={user.business_type}
                      />
                      <InfoField
                        label="Dirección de la Empresa"
                        value={
                          user.business_address && user.business_address_number
                            ? `${user.business_address} ${user.business_address_number}`
                            : user.business_address || null
                        }
                      />
                      <InfoField
                        label="Código Postal de la Empresa"
                        value={user.business_postal_code}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Detalles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Detalles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField label="Creado" value={formatDate(user.createdAt)} />
                <InfoField
                  label="Actualizado"
                  value={formatDate(user.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tablas - Ancho completo */}
        <div className="space-y-6">
          {/* Anuncios del usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Anuncios del Usuario ({adsTotalCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {userAds.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4" />
                              <span>Nombre</span>
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center space-x-2">
                              <Tag className="h-4 w-4" />
                              <span>Categoría</span>
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
                        {userAds.map((ad) => (
                          <TableRow key={ad.id}>
                            <TableCell>
                              <div className="font-medium">{ad.name}</div>
                              <div className="text-sm text-gray-500">
                                ID: {ad.id}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {ad.category?.name || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-green-600">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/ads/${ad.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  {adsTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-5">
                      <div className="text-sm text-gray-700">
                        Mostrando {userAds.length} de {adsTotalCount} anuncios -
                        Página {adsCurrentPage} de {adsTotalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAdsPageChange(Math.max(1, adsCurrentPage - 1))
                          }
                          disabled={adsCurrentPage === 1 || adsLoading}
                        >
                          {adsLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : null}
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAdsPageChange(
                              Math.min(adsTotalPages, adsCurrentPage + 1)
                            )
                          }
                          disabled={
                            adsCurrentPage === adsTotalPages || adsLoading
                          }
                        >
                          {adsLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : null}
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 px-5">
                  <p className="text-gray-500">
                    Este usuario no tiene anuncios publicados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservas del usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Reservas del Usuario ({reservationsTotalCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {userReservations.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4" />
                              <span>ID</span>
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
                              <CheckCircle className="h-4 w-4" />
                              <span>Estado</span>
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4" />
                              <span>Anuncio Asociado</span>
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
                        {userReservations.map((reservation) => (
                          <TableRow key={reservation.id}>
                            <TableCell>
                              <div className="font-medium">
                                #{reservation.id}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-green-600 flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
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
                                <span className="text-gray-500">
                                  Sin anuncio
                                </span>
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
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/reservations/${reservation.id}`
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {reservation.ad && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/ads/${reservation.ad!.id}`)
                                    }
                                    title="Ver anuncio asociado"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  {reservationsTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-5">
                      <div className="text-sm text-gray-700">
                        Mostrando {userReservations.length} de{' '}
                        {reservationsTotalCount} reservas - Página{' '}
                        {reservationsCurrentPage} de {reservationsTotalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleReservationsPageChange(
                              Math.max(1, reservationsCurrentPage - 1)
                            )
                          }
                          disabled={
                            reservationsCurrentPage === 1 || reservationsLoading
                          }
                        >
                          {reservationsLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : null}
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleReservationsPageChange(
                              Math.min(
                                reservationsTotalPages,
                                reservationsCurrentPage + 1
                              )
                            )
                          }
                          disabled={
                            reservationsCurrentPage ===
                              reservationsTotalPages || reservationsLoading
                          }
                        >
                          {reservationsLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : null}
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 px-5">
                  <p className="text-gray-500">
                    Este usuario no tiene reservas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Destacados del usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Destacados del Usuario ({featuredTotalCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {userFeatured.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Anuncio Asociado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userFeatured.map((featured) => (
                          <TableRow key={featured.id}>
                            <TableCell>
                              <div className="font-medium">#{featured.id}</div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-green-600 flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
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
                                <span className="text-gray-500">
                                  Sin anuncio
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {formatDate(featured.createdAt)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    router.push(`/features/${featured.id}`)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {featured.ad && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/ads/${featured.ad!.id}`)
                                    }
                                    title="Ver anuncio asociado"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  {featuredTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-5">
                      <div className="text-sm text-gray-700">
                        Mostrando {userFeatured.length} de {featuredTotalCount}{' '}
                        destacados - Página {featuredCurrentPage} de{' '}
                        {featuredTotalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFeaturedPageChange(
                              Math.max(1, featuredCurrentPage - 1)
                            )
                          }
                          disabled={
                            featuredCurrentPage === 1 || featuredLoading
                          }
                        >
                          {featuredLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : null}
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFeaturedPageChange(
                              Math.min(
                                featuredTotalPages,
                                featuredCurrentPage + 1
                              )
                            )
                          }
                          disabled={
                            featuredCurrentPage === featuredTotalPages ||
                            featuredLoading
                          }
                        >
                          {featuredLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : null}
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 px-5">
                  <p className="text-gray-500">
                    Este usuario no tiene destacados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
