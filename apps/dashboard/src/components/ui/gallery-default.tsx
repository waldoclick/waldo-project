'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface GalleryImage {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
    small?: {
      url: string;
      width: number;
      height: number;
    };
    medium?: {
      url: string;
      width: number;
      height: number;
    };
    large?: {
      url: string;
      width: number;
      height: number;
    };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface GalleryDefaultProps {
  images?: GalleryImage[];
}

export function GalleryDefault({ images = [] }: GalleryDefaultProps) {
  const [index, setIndex] = useState(-1);

  if (!images || images.length === 0) {
    return null;
  }

  // Función para construir URL absoluta
  const getAbsoluteUrl = (url: string): string => {
    // Si ya es una URL absoluta (http:// o https://), retornarla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si es relativa, construir URL absoluta con la base de Strapi
    const baseURL =
      process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    // Asegurar que la URL relativa empiece con /
    const relativeUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseURL}${relativeUrl}`;
  };

  // Función para obtener URL a través del proxy de Next.js
  const getNextImageUrl = (url: string, width?: number): string => {
    const absoluteUrl = getAbsoluteUrl(url);
    // Codificar la URL para pasarla como parámetro
    const encodedUrl = encodeURIComponent(absoluteUrl);
    // Construir la URL del proxy de Next.js
    const params = new URLSearchParams();
    params.set('url', absoluteUrl);
    if (width) {
      params.set('w', width.toString());
    }
    params.set('q', '90');
    return `/_next/image?${params.toString()}`;
  };

  const getThumbnailUrl = (image: GalleryImage): string => {
    // Usar small o medium para mejor calidad, fallback a thumbnail o url original
    const url =
      image.formats?.small?.url ||
      image.formats?.medium?.url ||
      image.formats?.thumbnail?.url ||
      image.url;
    return getAbsoluteUrl(url);
  };

  // Preparar imágenes para el lightbox (usar URL a través del proxy de Next.js)
  const lightboxImages = images.map((image) => {
    // Usar large o medium para el lightbox, fallback a url original
    const imageUrl =
      image.formats?.large?.url || image.formats?.medium?.url || image.url;
    // Usar el ancho original o un máximo razonable para el lightbox
    const maxWidth = Math.min(image.width || 1920, 1920);

    return {
      src: getNextImageUrl(imageUrl, maxWidth),
      alt: image.alternativeText || image.name,
      width: image.width,
      height: image.height,
    };
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Galería de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, imageIndex) => {
              const thumbnailUrl = getThumbnailUrl(image);

              return (
                <button
                  key={image.id}
                  onClick={() => setIndex(imageIndex)}
                  className="relative aspect-square overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer bg-gray-100"
                >
                  <Image
                    src={thumbnailUrl}
                    alt={image.alternativeText || image.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    quality={90}
                  />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={lightboxImages}
      />
    </>
  );
}
