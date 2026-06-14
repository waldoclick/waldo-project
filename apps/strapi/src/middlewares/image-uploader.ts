import sharp from "sharp";
import path from "path";
import fs from "fs";
import os from "os";

/**
 * Resolve an upload filepath and assert it is confined to the OS temp dir,
 * where Strapi's multipart parser writes uploads. Returns the real path for
 * subsequent fs operations.
 */
const resolveUploadPath = (filepath: string): string => {
  const resolved = fs.realpathSync(filepath);
  if (!resolved.startsWith(fs.realpathSync(os.tmpdir()) + path.sep)) {
    throw new Error("Upload filepath outside temp dir");
  }
  return resolved;
};

const MAX_WIDTH = 1024;
const WATERMARK_MARGIN = 30;
const WATERMARK_PATH = path.join(process.cwd(), "public/images/watermark.png");

interface UploadFile {
  mimetype: string;
  filepath: string;
  originalFilename: string;
}

/**
 * Base function to convert any image to WebP
 * @param file - File object from user upload
 */
const convertToWebP = async (file: unknown): Promise<void> => {
  const f = file as UploadFile;
  try {
    if (
      f.mimetype.includes("jpeg") ||
      f.mimetype.includes("jpg") ||
      f.mimetype.includes("png")
    ) {
      const resolved = resolveUploadPath(f.filepath);
      const imageBuffer = fs.readFileSync(resolved);

      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality: 100 })
        .toBuffer();

      fs.writeFileSync(resolved, webpBuffer);
      f.mimetype = "image/webp";
      f.originalFilename = f.originalFilename.replace(
        /\.(jpg|jpeg|png)$/i,
        ".webp",
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
const processGalleryImage = async (file: unknown): Promise<void> => {
  const f = file as UploadFile;
  try {
    const resolved = resolveUploadPath(f.filepath);
    const imageBuffer = fs.readFileSync(resolved);
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

    fs.writeFileSync(resolved, finalBuffer);
  } catch (error) {
    console.error("Error processing gallery image:", error);
  }
};

/**
 * Process avatar images - resize to 300x300px
 * @param file - File object from user upload
 */
const processAvatarImage = async (file: unknown): Promise<void> => {
  const f = file as UploadFile;
  try {
    const resolved = resolveUploadPath(f.filepath);
    const imageBuffer = fs.readFileSync(resolved);
    const processedBuffer = await sharp(imageBuffer)
      .resize(300, 300, {
        fit: "cover",
        position: "center",
        kernel: sharp.kernel.lanczos3,
      })
      .webp({ quality: 100, lossless: true })
      .toBuffer();

    fs.writeFileSync(resolved, processedBuffer);
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
      const processFile = async (file: unknown) => {
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
