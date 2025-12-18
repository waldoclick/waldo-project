'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoField } from '@/components/ui/info-field';
import { ArrowLeft, Edit, Info, Tag } from 'lucide-react';
import { getCategory } from '@/lib/strapi/categories';
import { StrapiCategory } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

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

  const { formatDate } = useFormatDate();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              {category.name}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              onClick={() => router.push(`/categories/${category.id}/edit`)}
            >
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
                  <Tag className="h-5 w-5 mr-2" />
                  Información de la Categoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={category.id} />
                  <InfoField label="Nombre" value={category.name} />
                  <InfoField label="Slug" value={category.slug} />
                  <div>
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: '#313338' }}
                    >
                      Color
                    </label>
                    {category.color ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="h-6 w-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.color}</span>
                      </div>
                    ) : (
                      <p className="mt-1">-</p>
                    )}
                  </div>
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
                  value={formatDate(category.createdAt)}
                />
                <InfoField
                  label="Actualizado"
                  value={formatDate(category.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
