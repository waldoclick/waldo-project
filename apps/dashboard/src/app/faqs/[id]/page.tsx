'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Star, FileText } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/faqs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{faq.title}</h1>
            <p className="text-gray-500">Detalles de la FAQ</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/faqs/${faq.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Información de la FAQ</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-lg font-semibold">{faq.id}</p>
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
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Creación
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(faq.createdAt)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Actualización
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(faq.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Respuesta completa */}
      <Card>
        <CardHeader>
          <CardTitle>Respuesta Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {faq.text}
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
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{faq.title}</h3>
                <div className="flex items-center space-x-2">
                  {faq.featured && (
                    <Badge
                      variant="default"
                      className="flex items-center space-x-1"
                    >
                      <Star className="h-3 w-3" />
                      <span>Destacada</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-gray-600">
              {faq.text.length > 200
                ? `${faq.text.substring(0, 200)}...`
                : faq.text}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
