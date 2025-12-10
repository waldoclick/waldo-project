'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X } from 'lucide-react';
import { getFaq, updateFaq } from '@/lib/strapi/faqs';
import { StrapiFaq } from '@/lib/strapi/types';

export default function EditFaqPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faq, setFaq] = useState<StrapiFaq | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    featured: false,
  });

  const faqId = params.id as string;

  const fetchFaq = useCallback(async () => {
    try {
      const response = await getFaq(parseInt(faqId));
      setFaq(response.data);
      setFormData({
        title: response.data.title,
        text: response.data.text,
        featured: response.data.featured,
      });
    } catch (error) {
      console.error('Error fetching faq:', error);
      alert('Error al cargar la FAQ');
      router.push('/dashboard/faqs');
    }
  }, [faqId, router]);

  useEffect(() => {
    fetchFaq();
  }, [fetchFaq]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!formData.text.trim()) {
      alert('El texto es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await updateFaq(parseInt(faqId), {
        title: formData.title.trim(),
        text: formData.text.trim(),
        featured: formData.featured,
      });

      router.push('/dashboard/faqs');
    } catch (error) {
      console.error('Error updating faq:', error);
      alert('Error al actualizar la FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/faqs');
  };

  if (!faq) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Editar FAQ</h1>
            <p className="text-gray-500">Modificar información de la FAQ</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Título *
                </label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ingresa el título de la pregunta"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="text"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Respuesta *
                </label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder="Ingresa la respuesta completa"
                  required
                  className="w-full min-h-[200px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked })
                  }
                />
                <Label htmlFor="featured">Marcar como destacada</Label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Información Actual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {faq.id}
                  </div>
                  <div>
                    <span className="font-medium">Creado:</span>{' '}
                    {new Date(faq.createdAt).toLocaleDateString('es-CL')}
                  </div>
                  <div>
                    <span className="font-medium">Actualizado:</span>{' '}
                    {new Date(faq.updatedAt).toLocaleDateString('es-CL')}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
