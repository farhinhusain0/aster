import * as fs from "fs/promises";
import * as path from "path";
import multer from "multer";
import { ImageUploader } from "./base";
import {
  ImageMetadata,
  ImageUploadResult,
  ImageDeleteResult,
  ImageUploadRequest,
} from "./types";

export class LocalImageUploader extends ImageUploader {
  protected configureMulter(): multer.Multer {
    console.log(
      "[LocalImageUploader] Configuring multer with storage path:",
      this.config.uploadPath,
    );
    const storage = multer.diskStorage({
      destination: (
        req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void,
      ) => {
        // Ensure the upload directory exists
        fs.mkdir(this.config.uploadPath, { recursive: true })
          .then(() => cb(null, this.config.uploadPath))
          .catch((err) => cb(err, this.config.uploadPath));
      },
      filename: (
        req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) => {
        // Generate a unique filename with timestamp
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
      },
    });

    return multer({
      storage,
      limits: {
        fileSize: this.config.maxFileSize,
      },
      fileFilter: (
        req: Express.Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
      ) => {
        if (this.config.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("File type not allowed"));
        }
      },
    });
  }

  public async uploadImage(
    req: ImageUploadRequest,
  ): Promise<ImageUploadResult> {
    console.log("[LocalImageUploader] Processing upload request");
    try {
      if (!req.file) {
        return {
          success: false,
          error: "No file uploaded",
        };
      }

      if (!this.validateFile(req.file)) {
        // Clean up the file if it was uploaded but invalid
        await fs.unlink(req.file.path);
        return {
          success: false,
          error: "Invalid file",
        };
      }

      try {
        console.log("[LocalImageUploader] Processing file:", {
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        });
        const processedFile = await this.processUploadedFile(req.file);
        const storagePath = path.relative(
          process.env.IMAGE_UPLOAD_DATA_DIRECTORY || "",
          processedFile.path,
        );
        console.log("[LocalImageUploader] File processed successfully:", {
          storagePath,
          finalPath: processedFile.path,
        });
        const metadata = {
          ...this.createImageMetadata(req.file),
          ...processedFile,
          storagePath,
        };

        return {
          success: true,
          metadata,
        };
      } catch (processError) {
        return {
          success: false,
          error:
            processError instanceof Error
              ? processError.message
              : "Failed to process image",
        };
      }
    } catch (error) {
      // Clean up any files if they exist
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  public async deleteImage(identifier: string): Promise<ImageDeleteResult> {
    console.log("[LocalImageUploader] Attempting to delete image:", identifier);
    try {
      const filePath = path.join(this.config.uploadPath, identifier);

      // Check if file exists before attempting to delete
      await fs.access(filePath);
      await fs.unlink(filePath);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      };
    }
  }

  public async getImageMetadata(
    identifier: string,
  ): Promise<ImageMetadata | null> {
    try {
      const filePath = path.join(this.config.uploadPath, identifier);
      const stats = await fs.stat(filePath);

      // Get file mime type based on extension
      const ext = path.extname(identifier).toLowerCase();
      const mimeType = this.getMimeTypeFromExtension(ext);

      return {
        filename: identifier,
        mimetype: mimeType,
        size: stats.size,
        path: filePath,
        storagePath: path.relative(
          process.env.IMAGE_UPLOAD_DATA_DIRECTORY || "",
          filePath,
        ),
        uploadedAt: stats.mtime,
      };
    } catch (error) {
      return null;
    }
  }

  private getMimeTypeFromExtension(ext: string): string {
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
}
