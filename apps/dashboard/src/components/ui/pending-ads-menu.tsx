'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Circle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPendingAds, StrapiAd } from '@/lib/strapi';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function PendingAdsMenu() {
  const [ads, setAds] = useState<StrapiAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingAds = async () => {
      try {
        setLoading(true);
        // Obtener los últimos 10 anuncios pendientes
        const response = await getPendingAds({
          page: 1,
          pageSize: 10,
          sort: 'createdAt:desc',
        });

        setAds(response.data);
      } catch (error) {
        console.error('Error fetching pending ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAds();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors">
          <Bell className="h-5 w-5" />
          {ads.length > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-orange-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
              {ads.length > 10 ? (
                <Circle className="h-2 w-2 fill-current" />
              ) : (
                ads.length
              )}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Anuncios Pendientes
          </h3>
          <Link
            href="/ads/pending"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver todas <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="border-b border-dashed border-gray-200 -mx-4"></div>
        <div className="max-h-96 overflow-y-auto -mx-4 -my-4">
          {loading ? (
            <div className="text-sm text-gray-500 text-center py-8">
              Cargando...
            </div>
          ) : ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Todo al día
              </p>
              <p className="text-xs text-gray-400 text-center">
                No hay anuncios pendientes de revisión
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {ads.map((ad, index) => (
                <Link
                  key={ad.id}
                  href={`/ads/${ad.id}`}
                  className={`flex items-center justify-between p-2 hover:bg-gray-50 transition-colors ${
                    index !== ads.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {ad.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ad.user?.username || ad.user?.email || 'Usuario'} •{' '}
                      {formatDate(ad.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
