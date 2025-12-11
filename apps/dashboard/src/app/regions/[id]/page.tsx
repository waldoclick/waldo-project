'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MapPin, Calendar, Hash, Users } from 'lucide-react';
import { getRegion } from '@/lib/strapi/regions';
import { StrapiRegion } from '@/lib/strapi/types';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/regions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{region.name}</h1>
            <p className="text-gray-500">Detalles de la región</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/regions/${region.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Información de la Región</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-lg font-semibold">{region.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre
                </label>
                <p className="text-lg font-semibold">{region.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Slug
                </label>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {region.slug}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Comunas
                </label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <Badge variant="outline">
                    {region.communes?.length || 0} comunas
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Creación
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(region.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Actualización
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(region.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de comunas */}
      {region.communes && region.communes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Comunas de {region.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {region.communes.map((commune) => (
                <div
                  key={commune.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{commune.name}</h3>
                      <p className="text-sm text-gray-500">ID: {commune.id}</p>
                    </div>
                    <Badge variant="secondary">{commune.slug}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!region.communes || region.communes.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No hay comunas asociadas a esta región
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
