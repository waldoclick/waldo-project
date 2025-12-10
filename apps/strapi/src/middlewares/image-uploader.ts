import sharp from "sharp";
import path from "path";
import fs from "fs";

const MAX_WIDTH = 1024;
const WATERMARK_MARGIN = 30;
const WATERMARK_PATH = path.join(process.cwd(), "public/images/watermark.png");

/**
 * Base function to convert any image to WebP
 * @param file - File object from user upload
 */
const convertToWebP = async (file: any): Promise<void> => {
  try {
    if (
      file.mimetype.includes("jpeg") ||
      file.mimetype.includes("jpg") ||
      file.mimetype.includes("png")
    ) {
      const imageBuffer = fs.readFileSync(file.filepath);

      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality: 100 })
        .toBuffer();

      fs.writeFileSync(file.filepath, webpBuffer);
      file.mimetype = "image/webp";
      file.originalFilename = file.originalFilename.replace(
        /\.(jpg|jpeg|png)$/i,
        ".webp"
      );
    }
  } catch (error) {
    console.error("Error converting to WebP:", error);
  }
};

/**
 * Process gallery images - resize to max width and add watermark
 * @param file - File object from user upload
 */
const processGalleryImage = async (file: any): Promise<void> => {
  try {
    const imageBuffer = fs.readFileSync(file.filepath);
    const metadata = await sharp(imageBuffer).metadata();

    let processedImage = sharp(imageBuffer);

    // Resize if needed
    if (metadata.width && metadata.width > MAX_WIDTH) {
      processedImage = processedImage.resize(MAX_WIDTH, null, {
        fit: "inside",
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      });
    }

    // Add watermark with original proportions (122.2 x 33)
    const WATERMARK_WIDTH = 150;
    const watermarkBuffer = await sharp(WATERMARK_PATH)
      .resize(WATERMARK_WIDTH, null, {
        fit: "contain",
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .toBuffer();

    const finalBuffer = await processedImage
      .composite([
        {
          input: watermarkBuffer,
          gravity: "northwest",
          top: WATERMARK_MARGIN,
          left: WATERMARK_MARGIN,
        },
      ])
      .webp({ quality: 100, lossless: true })
      .toBuffer();

    fs.writeFileSync(file.filepath, finalBuffer);
  } catch (error) {
    console.error("Error processing gallery image:", error);
  }
};

/**
 * Process avatar images - resize to 300x300px
 * @param file - File object from user upload
 */
const processAvatarImage = async (file: any): Promise<void> => {
  try {
    const imageBuffer = fs.readFileSync(file.filepath);
    const processedBuffer = await sharp(imageBuffer)
      .resize(300, 300, {
        fit: "cover",
        position: "center",
        kernel: sharp.kernel.lanczos3,
      })
      .webp({ quality: 100, lossless: true })
      .toBuffer();

    fs.writeFileSync(file.filepath, processedBuffer);
  } catch (error) {
    console.error("Error processing avatar image:", error);
  }
};

/**
 * Middleware to process uploaded images
 * @description
 * - Intercepts file uploads
 * - All images are first converted to WebP
 * - Then, based on type:
 *   - Gallery images are resized if wider than 1024px
 *   - Avatar images are resized to 300x300px
 *   - Other types will have their specific processing
 */
export default () => {
  return async (ctx, next) => {
    const files = ctx.request.files?.files;
    const uploadType = ctx.request.body?.type;

    if (files) {
      const processFile = async (file: any) => {
        // First, convert to WebP (applies to all images)
        await convertToWebP(file);

        // Then, apply type-specific processing
        switch (uploadType) {
          case "gallery":
            await processGalleryImage(file);
            break;
          case "avatar":
            await processAvatarImage(file);
            break;
          // Add more cases here for other types
        }
      };

      // Handle single or multiple files
      if (Array.isArray(files)) {
        for (const file of files) {
          await processFile(file);
        }
      } else {
        await processFile(files);
      }
    }

    await next();
  };
};
