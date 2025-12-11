'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Star, FileText, Hash } from 'lucide-react';
import { getFaq } from '@/lib/strapi/faqs';
import { StrapiFaq } from '@/lib/strapi/types';

export default function FaqDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [faq, setFaq] = useState<StrapiFaq | null>(null);
  const [loading, setLoading] = useState(true);

  const faqId = params.id as string;

  const fetchFaq = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFaq(parseInt(faqId));
      setFaq(response.data);
    } catch (error) {
      console.error('Error fetching faq:', error);
      alert('Error al cargar la FAQ');
      router.push('/faqs');
    } finally {
      setLoading(false);
    }
  }, [faqId, router]);

  useEffect(() => {
    fetchFaq();
  }, [fetchFaq]);

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

  if (!faq) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">FAQ no encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{faq.title}</h1>
            <p className="text-gray-600">Detalles de la FAQ</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button onClick={() => router.push(`/faqs/${faq.id}/edit`)}>
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
                  <FileText className="h-5 w-5 mr-2" />
                  Información de la FAQ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-lg font-semibold">{faq.id}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Título
                    </label>
                    <p className="text-lg font-semibold">{faq.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Estado
                    </label>
                    <div className="flex items-center space-x-2">
                      {faq.featured ? (
                        <Badge
                          variant="default"
                          className="flex items-center space-x-1"
                        >
                          <Star className="h-3 w-3" />
                          <span>Destacada</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Respuesta completa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Respuesta Completa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {faq.text}
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
                    <span>{formatDate(faq.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Última Actualización
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(faq.updatedAt)}</span>
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
