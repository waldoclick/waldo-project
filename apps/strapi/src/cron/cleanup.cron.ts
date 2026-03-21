import logger from "../utils/logtail";

export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

export class CleanupService {
  /**
   * Busca imágenes huérfanas en la carpeta 'ads' de Cloudinary
   * que no estén asociadas a ningún anuncio en la base de datos
   */
  async findOrphanImages(): Promise<ICronjobResult> {
    try {
      logger.info("=== INICIANDO BÚSQUEDA DE IMÁGENES HUÉRFANAS ===");

      // Verificar si strapi está definido
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      // 1. Obtener todas las imágenes de la carpeta 'ads' desde Strapi/Cloudinary
      const strapiImages = await this.getStrapiImages();
      logger.info(
        `Encontradas ${strapiImages.length} imágenes en carpeta 'ads'`
      );

      // 2. Obtener todas las imágenes asociadas a anuncios desde la base de datos
      const dbImages = await this.getDatabaseImages();
      logger.info(`Encontradas ${dbImages.length} imágenes en base de datos`);

      // 3. Encontrar imágenes huérfanas
      const orphanImages = this.findOrphans(strapiImages, dbImages);
      logger.info(`Encontradas ${orphanImages.length} imágenes huérfanas`);

      // 4. Log de imágenes huérfanas encontradas
      if (orphanImages.length > 0) {
        logger.warn("Imágenes huérfanas encontradas:", {
          count: orphanImages.length,
          images: orphanImages.map((img) => ({
            id: img.id,
            url: img.url,
            name: img.name,
            createdAt: img.createdAt,
          })),
        });
      }

      return {
        success: true,
        results: `Found ${orphanImages.length} orphan images in 'ads' folder`,
      };
    } catch (error) {
      logger.error("Error finding orphan images:", error);
      return { success: false, error: "Failed to find orphan images" };
    }
  }

  /**
   * Obtiene todas las imágenes de la carpeta 'ads' desde Strapi
   */
  private async getStrapiImages(): Promise<any[]> {
    try {
      // Usar el servicio de upload de Strapi para obtener imágenes
      const images = await strapi.entityService.findMany(
        "plugin::upload.file",
        {
          filters: {
            folder: {
              name: "ads", // Filtrar por carpeta 'ads'
            },
          },
          pagination: { pageSize: -1 },
        }
      );

      return images || [];
    } catch (error) {
      logger.error("Error fetching images from Strapi:", error);
      throw error;
    }
  }

  /**
   * Obtiene todas las imágenes asociadas a anuncios desde la base de datos
   */
  private async getDatabaseImages(): Promise<string[]> {
    try {
      // Obtener todos los anuncios con sus galerías
      const ads = (await strapi.entityService.findMany("api::ad.ad", {
        populate: {
          gallery: true,
        },
        pagination: { pageSize: -1 },
      })) as any[];

      const imageUrls: string[] = [];

      // Extraer URLs de las imágenes de la galería
      ads.forEach((ad) => {
        if (ad.gallery && Array.isArray(ad.gallery)) {
          ad.gallery.forEach((image: any) => {
            if (image.url) {
              imageUrls.push(image.url);
            }
            if (image.secure_url) {
              imageUrls.push(image.secure_url);
            }
          });
        }
      });

      return imageUrls;
    } catch (error) {
      logger.error("Error fetching images from database:", error);
      throw error;
    }
  }

  /**
   * Encuentra imágenes que están en Strapi/Cloudinary pero no en la base de datos
   */
  private findOrphans(strapiImages: any[], dbImages: string[]): any[] {
    const dbImageSet = new Set(dbImages);

    return strapiImages.filter((strapiImg) => {
      // Verificar si la imagen de Strapi está en la base de datos
      const isInDatabase =
        dbImageSet.has(strapiImg.url) || dbImageSet.has(strapiImg.secure_url);

      return !isInDatabase;
    });
  }

  /**
   * Elimina imágenes huérfanas usando Strapi (OPCIONAL - usar con precaución)
   */
  async deleteOrphanImages(orphanImages: any[]): Promise<ICronjobResult> {
    try {
      logger.info(
        `=== INICIANDO ELIMINACIÓN DE ${orphanImages.length} IMÁGENES HUÉRFANAS ===`
      );

      const deletedImages = [];
      const failedDeletions = [];

      for (const image of orphanImages) {
        try {
          // Usar Strapi para eliminar la imagen
          await strapi.entityService.delete("plugin::upload.file", image.id);

          deletedImages.push(image.id);
          logger.info(`Imagen eliminada: ${image.id} - ${image.name}`);
        } catch (error) {
          failedDeletions.push({
            id: image.id,
            name: image.name,
            error: error.message,
          });
          logger.error(
            `Error eliminando imagen ${image.id} - ${image.name}:`,
            error
          );
        }
      }

      logger.info(`=== ELIMINACIÓN COMPLETADA ===`, {
        deleted: deletedImages.length,
        failed: failedDeletions.length,
        deletedImages,
        failedDeletions,
      });

      return {
        success: true,
        results: `Deleted ${deletedImages.length} images, ${failedDeletions.length} failed`,
      };
    } catch (error) {
      logger.error("Error deleting orphan images:", error);
      return { success: false, error: "Failed to delete orphan images" };
    }
  }
}
