'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Save,
  X,
  Package,
  DollarSign,
  Clock,
  Star,
  Box,
} from 'lucide-react';
import { getAdPack, updateAdPack, StrapiAdPack } from '@/lib/strapi';

export default function EditPackPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<StrapiAdPack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    total_days: '',
    total_ads: '',
    total_features: '',
    price: '',
    description: '',
  });

  const packId = params.id as string;

  const fetchPack = useCallback(async () => {
    try {
      const response = await getAdPack(parseInt(packId));
      setPack(response.data);
      setFormData({
        name: response.data.name,
        text: response.data.text,
        total_days: response.data.total_days.toString(),
        total_ads: response.data.total_ads.toString(),
        total_features: response.data.total_features.toString(),
        price: response.data.price.toString(),
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Error fetching pack:', error);
      alert('Error al cargar el pack');
      router.push('/packs');
    }
  }, [packId, router]);

  useEffect(() => {
    fetchPack();
  }, [fetchPack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!formData.text.trim()) {
      alert('El texto es obligatorio');
      return;
    }

    if (!formData.total_days || parseInt(formData.total_days) <= 0) {
      alert('Los días totales deben ser un número mayor a 0');
      return;
    }

    if (!formData.total_ads || parseInt(formData.total_ads) <= 0) {
      alert('El total de anuncios debe ser un número mayor a 0');
      return;
    }

    if (!formData.total_features || parseInt(formData.total_features) < 0) {
      alert('El total de features debe ser un número mayor o igual a 0');
      return;
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      alert('El precio debe ser un número mayor a 0');
      return;
    }

    try {
      setLoading(true);
      await updateAdPack(parseInt(packId), {
        name: formData.name.trim(),
        text: formData.text.trim(),
        total_days: parseInt(formData.total_days),
        total_ads: parseInt(formData.total_ads),
        total_features: parseInt(formData.total_features),
        price: parseInt(formData.price),
        description: formData.description.trim() || undefined,
      });

      router.push(`/packs/${packId}`);
    } catch (error) {
      console.error('Error updating pack:', error);
      const errorMessage =
        error instanceof Error
          ? error.message.includes('403')
            ? 'No tienes permisos para actualizar este pack. Verifica tus permisos en Strapi.'
            : error.message
          : 'Error al actualizar el pack';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/packs');
  };

  const formatPrice = (value: string) => {
    if (!value) return '';
    const number = parseInt(value.replace(/\D/g, ''));
    return new Intl.NumberFormat('es-CL').format(number);
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!pack) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Waldo', href: '/' },
            { label: 'Packs', href: '/packs' },
            { label: pack?.name ?? 'Editar Pack', href: `/packs/${packId}` },
            { label: 'Editar' },
          ]}
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              Editar Pack
            </h1>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Información del Pack</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre del Pack *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Pack Básico"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Texto del Pack *
                  </label>
                  <Input
                    id="text"
                    type="text"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    placeholder="Ej: Ideal para comenzar"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              {/* Configuración del pack */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="total_days"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Clock className="h-4 w-4 inline mr-1" />
                    Duración (días) *
                  </label>
                  <Input
                    id="total_days"
                    type="number"
                    min="1"
                    value={formData.total_days}
                    onChange={(e) =>
                      setFormData({ ...formData, total_days: e.target.value })
                    }
                    placeholder="30"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_ads"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Package className="h-4 w-4 inline mr-1" />
                    Total Anuncios *
                  </label>
                  <Input
                    id="total_ads"
                    type="number"
                    min="1"
                    value={formData.total_ads}
                    onChange={(e) =>
                      setFormData({ ...formData, total_ads: e.target.value })
                    }
                    placeholder="5"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="total_features"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Star className="h-4 w-4 inline mr-1" />
                    Total Features *
                  </label>
                  <Input
                    id="total_features"
                    type="number"
                    min="0"
                    value={formData.total_features}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_features: e.target.value,
                      })
                    }
                    placeholder="3"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Precio (CLP) *
                  </label>
                  <Input
                    id="price"
                    type="text"
                    value={formatPrice(formData.price)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, price: value });
                    }}
                    placeholder="15.000"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Descripción (Opcional)
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripción detallada del pack..."
                  rows={4}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Descripción detallada que aparecerá en la vista del pack
                </p>
              </div>

              {/* Información actual */}
              <div className="bg-gray-50 p-3 rounded-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Información Actual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {pack.id}
                  </div>
                  <div>
                    <span className="font-medium">Precio Original:</span>{' '}
                    {formatCurrency(pack.price)}
                  </div>
                  <div>
                    <span className="font-medium">Días Originales:</span>{' '}
                    {pack.total_days}
                  </div>
                  <div>
                    <span className="font-medium">Creado:</span>{' '}
                    {new Date(pack.createdAt).toLocaleDateString('es-CL')}
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
