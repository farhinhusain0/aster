export function prepareLocallyUploadedImageUrl(imagePath: string | undefined) {
  if (!imagePath) return "";
  return `${process.env.DASHBOARD_API_URL}/uploads/${imagePath}`;
}