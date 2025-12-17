'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  User,
  Package,
  Hash,
  Star,
  XCircle,
  ExternalLink,
  Mail,
  Info,
  CheckCircle,
} from 'lucide-react';
import { getAdFeaturedReservation } from '@/lib/strapi';
import { StrapiAdFeaturedReservation } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';
import { InfoField } from '@/components/ui/info-field';

export default function DestacadoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatDate } = useFormatDate();
  const [featured, setFeatured] = useState<StrapiAdFeaturedReservation | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const featuredId = params.id as string;

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdFeaturedReservation(parseInt(featuredId));
      setFeatured(response.data);
    } catch (error) {
      console.error('Error fetching featured reservation:', error);
      alert('Error al cargar el destacado');
      router.push('/features');
    } finally {
      setLoading(false);
    }
  }, [featuredId, router]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Destacado no encontrado</p>
      </div>
    );
  }

  const isUsed = !!featured.ad;
  const featuredHref = '/features/used';
  const featuredSectionHref = isUsed ? '/features/used' : '/features/free';
  const featuredSectionLabel = isUsed ? 'Usados' : 'Libres';
  const breadcrumbsItems = [
    { label: 'Waldo', href: '/' },
    { label: 'Destacados', href: featuredHref },
    { label: featuredSectionLabel, href: featuredSectionHref },
    { label: `Destacado #${featured.id}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs items={breadcrumbsItems} />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Destacado #{featured.id}
              </h1>
            </div>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información principal del destacado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Información del Destacado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={featured.id} />
                  <InfoField
                    label="Precio"
                    value={formatPrice(featured.price)}
                  />
                  <InfoField
                    label="Duración"
                    value={`${featured.total_days || 0} días`}
                  />
                  <div>
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: '#313338' }}
                    >
                      Estado
                    </label>
                    <div className="mt-1">
                      {isUsed ? (
                        <Badge
                          variant="default"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Usado
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-800"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Libre
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {featured.description && (
                  <InfoField label="Descripción" value={featured.description} />
                )}
              </CardContent>
            </Card>

            {/* Información del usuario */}
            {featured.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Usuario
                    </span>
                    <Button
                      variant="brandOutline"
                      size="brand"
                      onClick={() =>
                        featured.user &&
                        router.push(`/users/${featured.user.id}`)
                      }
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Usuario
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="Nombre de Usuario"
                      value={featured.user.username}
                      type="link"
                      href={`/users/${featured.user.id}`}
                    />
                    <InfoField
                      label="Email"
                      value={featured.user.email}
                      type="email"
                    />
                    <InfoField
                      label="Estado"
                      value={`${featured.user.confirmed ? 'Confirmado' : 'No Confirmado'}, ${featured.user.blocked ? 'Bloqueado' : 'Activo'}`}
                    />
                    <InfoField
                      label="Proveedor"
                      value={featured.user.provider}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información del anuncio (solo si está usado) */}
            {featured.ad && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Anuncio Destacado
                    </span>
                    <Button
                      variant="brandOutline"
                      size="brand"
                      onClick={() =>
                        featured.ad && router.push(`/ads/${featured.ad.id}`)
                      }
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Anuncio
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Nombre" value={featured.ad.name} />
                    <InfoField
                      label="Precio del Anuncio"
                      value={formatPrice(featured.ad.price)}
                    />
                    <InfoField
                      label="Categoría"
                      value={featured.ad.category?.name}
                    />
                    <InfoField
                      label="Comuna"
                      value={featured.ad.commune?.name}
                    />
                    <InfoField
                      label="Estado"
                      value={`${featured.ad.active ? 'Activo' : 'Inactivo'}${featured.ad.rejected ? ', Rechazado' : ''}`}
                    />
                    <InfoField
                      label="Propietario del Anuncio"
                      value={featured.ad.user?.username}
                    />
                  </div>

                  {featured.ad.description && (
                    <InfoField
                      label="Descripción del Anuncio"
                      value={featured.ad.description}
                    />
                  )}
                </CardContent>
              </Card>
            )}
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
                <InfoField
                  label="Creado"
                  value={formatDate(featured.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(featured.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
