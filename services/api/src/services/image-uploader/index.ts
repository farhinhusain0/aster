import path from "path";
import { LocalImageUploader } from "./local";

export * from "./base";
export * from "./types";
export * from "./local";

export function initAvatarImageUploader(uploadPath: string) {
  if (!process.env.IMAGE_UPLOAD_DATA_DIRECTORY) {
    throw new Error("IMAGE_UPLOAD_DATA_DIRECTORY is not set");
  }

  return new LocalImageUploader({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    uploadPath: path.join(process.env.IMAGE_UPLOAD_DATA_DIRECTORY || "", uploadPath), // Store in IMAGE_UPLOAD_DATA_DIRECTORY directory
    convertToWebP: true,
    webp: {
      quality: 80,
      effort: 2,
    },
  });
}
