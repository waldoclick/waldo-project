'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoField } from '@/components/ui/info-field';
import { ArrowLeft, Edit, Info, Star, HelpCircle } from 'lucide-react';
import { getFaq } from '@/lib/strapi/faqs';
import { StrapiFaq } from '@/lib/strapi/types';
import { useFormatDate } from '@/hooks/useFormatDate';

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

  const { formatDate } = useFormatDate();

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
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Waldo', href: '/' },
              { label: 'FAQ', href: '/faqs' },
              { label: faq.title },
            ]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                {faq.title}
              </h1>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Información de la FAQ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="ID" value={faq.id} />
                  <InfoField label="Título" value={faq.title} />
                  <div>
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: '#313338' }}
                    >
                      Estado
                    </label>
                    <div className="mt-1">
                      {faq.featured ? (
                        <Badge
                          variant="default"
                          className="flex items-center space-x-1 w-fit"
                        >
                          <Star className="h-3 w-3" />
                          <span>Destacada</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="w-fit">
                          Normal
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    className="text-xs font-bold uppercase"
                    style={{ color: '#313338' }}
                  >
                    Respuesta Completa
                  </label>
                  <div className="mt-1 prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {faq.text}
                    </div>
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
                <InfoField label="Creado" value={formatDate(faq.createdAt)} />
                <InfoField
                  label="Actualizado"
                  value={formatDate(faq.updatedAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
