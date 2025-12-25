import multer from "multer";
import sharp from "sharp";
import * as path from "path";
import * as fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';
import {
  ImageMetadata,
  ImageUploadResult,
  ImageDeleteResult,
  ImageUploaderConfig,
  ImageUploadRequest,
} from "./types";

export abstract class ImageUploader {
  protected config: ImageUploaderConfig;
  protected multerInstance: multer.Multer;

  constructor(config: ImageUploaderConfig) {
    console.log("[ImageUploader] Initializing with config:", {
      maxFileSize: config.maxFileSize,
      allowedMimeTypes: config.allowedMimeTypes,
      convertToWebP: config.convertToWebP,
    });
    this.config = config;
    this.validateConfig();
    this.multerInstance = this.configureMulter();
  }

  /**
   * Validates the configuration provided to the image uploader
   * @throws Error if configuration is invalid
   */
  protected validateConfig(): void {
    if (!this.config.maxFileSize || this.config.maxFileSize <= 0) {
      throw new Error("Invalid maxFileSize configuration");
    }
    if (
      !Array.isArray(this.config.allowedMimeTypes) ||
      this.config.allowedMimeTypes.length === 0
    ) {
      throw new Error("allowedMimeTypes must be a non-empty array");
    }
    if (!this.config.uploadPath) {
      throw new Error("uploadPath is required");
    }
  }

  /**
   * Configures multer instance with storage and file filtering
   * This method should be implemented by concrete classes
   */
  protected abstract configureMulter(): multer.Multer;

  /**
   * Middleware for handling file uploads
   * @param fieldName The name of the form field that contains the image file (defaults to "image")
   */
  public uploadMiddleware(fieldName: string = "image"): any {
    return this.multerInstance.single(fieldName);
  }

  /**
   * Uploads a single image
   * @param req Express request object containing the file
   */
  public abstract uploadImage(
    req: ImageUploadRequest,
  ): Promise<ImageUploadResult>;

  /**
   * Deletes an image by its identifier
   * @param identifier Unique identifier for the image (e.g., filename or path)
   */
  public abstract deleteImage(identifier: string): Promise<ImageDeleteResult>;

  /**
   * Retrieves metadata for an uploaded image
   * @param identifier Unique identifier for the image
   */
  public abstract getImageMetadata(
    identifier: string,
  ): Promise<ImageMetadata | null>;

  /**
   * Validates if a file meets the configured requirements
   * @param file File object from multer
   */
  protected validateFile(file: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    const isValidSize = file.size <= this.config.maxFileSize;
    const isValidType = this.config.allowedMimeTypes.includes(file.mimetype);

    return isValidSize && isValidType;
  }

  /**
   * Creates standardized metadata for an uploaded image
   * @param file File object from multer
   */
  protected createImageMetadata(
    file: Express.Multer.File,
  ): Omit<ImageMetadata, "storagePath"> {
    return {
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedAt: new Date(),
    };
  }

  /**
   * Converts an image to WebP format
   * @param filePath Path to the original file
   * @param originalName Original filename
   * @returns Path to the converted WebP file
   */
  protected async convertToWebP(
    filePath: string,
    originalName: string,
  ): Promise<string> {
    console.log("[ImageUploader] Converting image to WebP:", {
      filePath,
      originalName,
    });
    const webpOptions = this.config.webp || {
      quality: 80,
      effort: 4,
      lossless: false,
    };

    const webpFilename = uuidv4() + '.webp';
    const webpPath = path.join(path.dirname(filePath), webpFilename);

    await sharp(filePath).webp(webpOptions).toFile(webpPath);

    // Remove the original file
    await fs.unlink(filePath);

    return webpPath;
  }

  /**
   * Processes the uploaded file, including WebP conversion if enabled
   * @param file The uploaded file
   * @returns Processed file information
   */
  protected async processUploadedFile(
    file: Express.Multer.File,
  ): Promise<{ path: string; filename: string; mimetype: string }> {
    let finalPath = file.path;
    let finalFilename = file.filename;
    let finalMimetype = file.mimetype;

    // Convert to WebP if enabled and the file is not already WebP
    if (this.config.convertToWebP && !file.mimetype.includes("webp")) {
      try {
        finalPath = await this.convertToWebP(file.path, file.originalname);
        finalFilename = path.basename(finalPath);
        finalMimetype = "image/webp";
      } catch (error) {
        // Clean up the original file if conversion fails
        await fs.unlink(file.path);
        throw new Error("Failed to convert image to WebP format");
      }
    }

    return {
      path: finalPath,
      filename: finalFilename,
      mimetype: finalMimetype,
    };
  }
}
