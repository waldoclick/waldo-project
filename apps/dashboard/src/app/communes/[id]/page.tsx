'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Hash,
  Building,
} from 'lucide-react';
import { getCommune } from '@/lib/strapi/communes';
import { StrapiCommune } from '@/lib/strapi/types';

export default function CommuneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [commune, setCommune] = useState<StrapiCommune | null>(null);
  const [loading, setLoading] = useState(true);

  const communeId = params.id as string;

  const fetchCommune = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCommune(parseInt(communeId));
      setCommune(response.data);
    } catch (error) {
      console.error('Error fetching commune:', error);
      alert('Error al cargar la comuna');
      router.push('/communes');
    } finally {
      setLoading(false);
    }
  }, [communeId, router]);

  useEffect(() => {
    fetchCommune();
  }, [fetchCommune]);

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

  if (!commune) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Comuna no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{commune.name}</h1>
            <p className="text-gray-600">Detalles de la comuna</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button onClick={() => router.push(`/communes/${commune.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Información de la Comuna
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID
                    </label>
                    <p className="text-lg font-semibold">{commune.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre
                    </label>
                    <p className="text-lg font-semibold">{commune.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Slug
                    </label>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {commune.slug}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Región
                    </label>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>
                        {commune.region?.name || 'Sin región asignada'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de la región */}
            {commune.region && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Región Asociada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {commune.region.name}
                        </h3>
                        <p className="text-gray-500">
                          ID: {commune.region.id} • Slug: {commune.region.slug}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/regions/${commune.region?.id}`)
                      }
                    >
                      Ver Región
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!commune.region && (
              <Card>
                <CardContent className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Esta comuna no tiene una región asignada
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Información de Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Creación
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(commune.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Última Actualización
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(commune.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
