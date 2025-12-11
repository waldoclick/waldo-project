'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

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
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const getThumbnailUrl = (image: GalleryImage): string => {
    return image.formats?.thumbnail?.url || image.url;
  };

  const getLargeImageUrl = (image: GalleryImage): string => {
    return (
      image.formats?.large?.url ||
      image.formats?.medium?.url ||
      image.formats?.small?.url ||
      image.url
    );
  };

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
            {images.map((image) => {
              const thumbnailUrl = getThumbnailUrl(image);
              const isCloudinary = thumbnailUrl.includes('cloudinary.com');

              return (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  {isCloudinary ? (
                    <img
                      src={thumbnailUrl}
                      alt={image.alternativeText || image.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <Image
                      src={thumbnailUrl}
                      alt={image.alternativeText || image.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal para imagen grande */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90"
          showCloseButton={true}
        >
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              <div className="relative max-w-full max-h-[90vh] flex items-center justify-center">
                <img
                  src={getLargeImageUrl(selectedImage)}
                  alt={selectedImage.alternativeText || selectedImage.name}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
              </div>

              {selectedImage.caption && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg">
                  <p className="text-sm">{selectedImage.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
