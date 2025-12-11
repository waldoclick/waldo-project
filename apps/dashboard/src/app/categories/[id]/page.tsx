'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Hash } from 'lucide-react';
import { getCategory } from '@/lib/strapi/categories';
import { StrapiCategory } from '@/lib/strapi/types';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<StrapiCategory | null>(null);
  const [loading, setLoading] = useState(true);

  const categoryId = params.id as string;

  const fetchCategory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCategory(parseInt(categoryId));
      setCategory(response.data);
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Error al cargar la categoría');
      router.push('/categories');
    } finally {
      setLoading(false);
    }
  }, [categoryId, router]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

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

  if (!category) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Categoría no encontrada</p>
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
            onClick={() => router.push('/categories')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-gray-500">Detalles de la categoría</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/categories/${category.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-lg font-semibold">{category.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre
                </label>
                <p className="text-lg font-semibold">{category.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Slug
                </label>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Color
                </label>
                {category.color ? (
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-6 w-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.color}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Sin color asignado</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Creación
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(category.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Actualización
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(category.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg font-medium text-purple-600">
                {category.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-gray-500">Slug: {category.slug}</p>
            </div>
            {category.color && (
              <div className="flex items-center space-x-2">
                <div
                  className="h-6 w-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.color}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
