'use client';

interface GalleryImage {
  id?: number;
  name?: string;
  alternativeText?: string;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

interface GalleryThumbnailsProps {
  images?: GalleryImage[];
  maxVisible?: number;
  size?: number;
  overlap?: number;
}

export function GalleryThumbnails({
  images = [],
  maxVisible = 3,
  size = 45,
  overlap = 6,
}: GalleryThumbnailsProps) {
  const getImageUrl = (
    image: GalleryImage | null | undefined
  ): string | null => {
    if (!image) return null;
    // Usar thumbnail para las miniaturas en la tabla
    const url = image.formats?.thumbnail?.url || image.url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseURL =
      process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return `${baseURL}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const visibleImages = images.slice(0, maxVisible);
  const remainingCount =
    images.length > maxVisible ? images.length - maxVisible : 0;

  if (visibleImages.length === 0) {
    return (
      <div
        className="rounded-full bg-gray-100 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-400">Sin imágenes</span>
      </div>
    );
  }

  // Calcular el margin negativo para el solapamiento
  const overlapStyle = {
    marginLeft: `-${overlap * 4}px`, // 4px por unidad de Tailwind (space-x-6 = 24px = 6*4px)
  };

  return (
    <div className="flex items-center" style={overlapStyle}>
      {visibleImages.map((image, idx) => {
        const imageUrl = getImageUrl(image);
        if (!imageUrl) return null;
        return (
          <div
            key={image.id || idx}
            className="relative rounded-full border-2 border-white overflow-hidden bg-gray-100"
            style={{
              width: size,
              height: size,
              zIndex: visibleImages.length - idx,
            }}
          >
            <img
              src={imageUrl}
              alt={image.alternativeText || image.name || 'Gallery image'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div
          className="relative rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 z-0"
          style={{ width: size, height: size }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
