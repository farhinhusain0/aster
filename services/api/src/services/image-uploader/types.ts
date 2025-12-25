import { Request } from 'express';

export interface ImageMetadata {
  filename: string;      // The final filename with extension
  mimetype: string;      // The MIME type of the stored file
  size: number;         // File size in bytes
  path: string;         // Full storage path
  storagePath: string;  // The path relative to storage root (e.g., 'uploads/image_abc.webp')
  uploadedAt: Date;     // Upload timestamp
}

export interface ImageUploadResult {
  success: boolean;
  metadata?: ImageMetadata;
  error?: string;
}

export interface ImageDeleteResult {
  success: boolean;
  error?: string;
}

export interface WebPOptions {
  quality?: number;  // 1-100
  lossless?: boolean;
  nearLossless?: boolean;
  alphaQuality?: number;  // 1-100
  effort?: number;  // 0-6
}

export interface ImageUploaderConfig {
  maxFileSize: number;  // in bytes
  allowedMimeTypes: string[];
  uploadPath: string;
  webp?: WebPOptions;  // WebP conversion options
  convertToWebP?: boolean;  // Whether to convert images to WebP format
}

// Extended Express Request type that includes the file from multer
export interface ImageUploadRequest extends Request {
  file?: Express.Multer.File;
}
