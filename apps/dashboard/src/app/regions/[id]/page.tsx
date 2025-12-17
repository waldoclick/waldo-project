'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoField } from '@/components/ui/info-field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, MapPin, Info, Eye } from 'lucide-react';
import { getRegion } from '@/lib/strapi/regions';
import { StrapiRegion } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [region, setRegion] = useState<StrapiRegion | null>(null);
  const [loading, setLoading] = useState(true);

  const regionId = params.id as string;

  const fetchRegion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRegion(parseInt(regionId));
      setRegion(response.data);
    } catch (error) {
      console.error('Error fetching region:', error);
      alert('Error al cargar la región');
      router.push('/regions');
    } finally {
      setLoading(false);
    }
  }, [regionId, router]);

  useEffect(() => {
    fetchRegion();
  }, [fetchRegion]);

  const { formatDate } = useFormatDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Región no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Waldo', href: '/' },
              { label: 'Regiones', href: '/regions' },
              { label: region.name },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                {region.name}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button onClick={() => router.push(`/regions/${region.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Información de la Región
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={region.id} />
                  <InfoField label="Nombre" value={region.name} />
                  <InfoField label="Slug" value={region.slug} />
                  <InfoField
                    label="Comunas"
                    value={`${region.communes?.length || 0} comunas`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                  value={formatDate(region.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(region.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de comunas - Ancho completo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Comunas de {region.name} ({region.communes?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {region.communes && region.communes.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">
                          <span>ID</span>
                        </TableHead>
                        <TableHead>
                          <span>Comuna</span>
                        </TableHead>
                        <TableHead>
                          <span>Slug</span>
                        </TableHead>
                        <TableHead>
                          <span>Región</span>
                        </TableHead>
                        <TableHead>
                          <span>Fecha de Creación</span>
                        </TableHead>
                        <TableHead className="text-right pr-6">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {region.communes.map((commune) => (
                        <TableRow key={commune.id}>
                          <TableCell className="pl-6">
                            <div className="font-medium">#{commune.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{commune.name}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {commune.slug}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {commune.region?.name || region.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDate(commune.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/communes/${commune.id}`)
                                }
                                className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/communes/${commune.id}/edit`)
                                }
                                className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
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
              </>
            ) : (
              <div className="text-center py-8 px-5">
                <p className="text-gray-500">
                  No hay comunas asociadas a esta región
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
