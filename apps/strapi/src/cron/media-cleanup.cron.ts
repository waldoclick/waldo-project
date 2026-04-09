import logger from "../utils/logtail";

interface StrapiUploadFile {
  id: number;
  url: string;
  secure_url?: string;
  name: string;
  createdAt: string;
}

interface StrapiAd {
  gallery?: StrapiUploadFile[];
}

export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

export class CleanupService {
  /**
   * Finds orphan images in the 'ads' folder in Strapi/Cloudinary
   * that are not associated with any ad in the database.
   *
   * Audit-only: logs orphans and returns the result — never auto-deletes.
   * Deletion must be triggered manually via deleteOrphanImages().
   */
  async findOrphanImages(): Promise<ICronjobResult> {
    try {
      logger.info("=== ORPHAN IMAGE SEARCH STARTED ===");

      // Verify that strapi is defined in the global scope
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      // 1. Fetch all images in the 'ads' folder from Strapi/Cloudinary
      const strapiImages = await this.getStrapiImages();
      logger.info(`Found ${strapiImages.length} images in the 'ads' folder`);

      // 2. Fetch all image URLs referenced by active ads in the database
      const dbImages = await this.getDatabaseImages();
      logger.info(`Found ${dbImages.length} images referenced in the database`);

      // 3. Compute the set difference: images in Strapi but not referenced by any ad
      const orphanImages = this.findOrphans(strapiImages, dbImages);
      logger.info(`Found ${orphanImages.length} orphan images`);

      // 4. Log detected orphans for manual review
      if (orphanImages.length > 0) {
        logger.warn("Orphan images detected:", {
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
   * Fetches all upload files that belong to the 'ads' folder in Strapi.
   *
   * Why two steps?
   * In Strapi v5, `db.query('plugin::upload.file')` does NOT
   * support relation-traversal filters (e.g. `folder: { name: 'ads' }`).
   * Passing such a filter silently returns an empty array.
   *
   * The correct approach is to filter by the `folderPath` string attribute,
   * which stores the folder's numeric path (e.g. "/1"). Since we know only
   * the folder name ("ads"), we must first resolve the folder's path string
   * via `db.query`, then use that path value in the file filter.
   */
  private async getStrapiImages(): Promise<StrapiUploadFile[]> {
    try {
      // Step 1: Resolve the 'ads' folder to get its numeric path string.
      // `folderPath` on upload files contains the folder's path (e.g. "/1"),
      // not the human-readable name — so we must look the folder up first.
      const adsFolder = await strapi.db
        .query("plugin::upload.folder")
        .findOne({ where: { name: "ads" } });

      // If the 'ads' folder does not exist yet (no ads have been uploaded),
      // there are no images to check — return an empty set safely.
      if (!adsFolder) {
        logger.warn(
          "Folder 'ads' not found in Strapi — skipping orphan detection"
        );
        return [];
      }

      // Step 2: Filter upload files by the resolved folderPath.
      // This is the supported Strapi v5 pattern for scoping files to a folder.
      const images = await strapi.db.query("plugin::upload.file").findMany({
        where: { folderPath: adsFolder.path },
        limit: -1,
      });

      return (images as unknown as StrapiUploadFile[]) || [];
    } catch (error) {
      logger.error("Error fetching images from Strapi:", error);
      throw error;
    }
  }

  /**
   * Fetches all image URLs referenced by ads in the database.
   *
   * This builds the "known good" set: any file URL that appears here
   * is actively in use and must not be treated as an orphan.
   * We populate the gallery relation on every ad to collect all referenced URLs.
   */
  private async getDatabaseImages(): Promise<string[]> {
    try {
      // Fetch all ads with their gallery relations populated
      const ads = (await strapi.db.query("api::ad.ad").findMany({
        populate: {
          gallery: true,
        },
        limit: -1,
      })) as unknown as StrapiAd[];

      const imageUrls: string[] = [];

      // Extract all image URLs from each ad's gallery
      ads.forEach((ad) => {
        if (ad.gallery && Array.isArray(ad.gallery)) {
          ad.gallery.forEach((image: StrapiUploadFile) => {
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
   * Computes orphan images using set-difference logic.
   *
   * An image is an orphan if it exists in Strapi (uploaded to the 'ads' folder)
   * but its URL does not appear in the set of URLs referenced by any active ad.
   * Both `url` and `secure_url` are checked to handle HTTP/HTTPS variants.
   */
  private findOrphans(
    strapiImages: StrapiUploadFile[],
    dbImages: string[]
  ): StrapiUploadFile[] {
    const dbImageSet = new Set(dbImages);

    return strapiImages.filter((strapiImg) => {
      // An image is considered "in use" if either its url or secure_url
      // appears in the set of URLs referenced by at least one ad
      const isInDatabase =
        dbImageSet.has(strapiImg.url) || dbImageSet.has(strapiImg.secure_url);

      return !isInDatabase;
    });
  }

  /**
   * Deletes the given orphan images via the Strapi db query API.
   *
   * NOTE: This method exists for manual/administrative use only.
   * It is intentionally NOT called by the cron job — deletion is a
   * destructive operation and must be triggered explicitly after reviewing
   * the orphan list produced by findOrphanImages().
   */
  async deleteOrphanImages(
    orphanImages: StrapiUploadFile[]
  ): Promise<ICronjobResult> {
    try {
      logger.info(`=== DELETING ${orphanImages.length} ORPHAN IMAGES ===`);

      const deletedImages = [];
      const failedDeletions = [];

      for (const image of orphanImages) {
        try {
          // Delete the image file record via Strapi db query
          await strapi.db
            .query("plugin::upload.file")
            .delete({ where: { id: image.id } });

          deletedImages.push(image.id);
          logger.info(`Image deleted: ${image.id} - ${image.name}`);
        } catch (error) {
          failedDeletions.push({
            id: image.id,
            name: image.name,
            error: error.message,
          });
          logger.error(
            `Error deleting image ${image.id} - ${image.name}:`,
            error
          );
        }
      }

      logger.info(`=== DELETION COMPLETE ===`, {
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
