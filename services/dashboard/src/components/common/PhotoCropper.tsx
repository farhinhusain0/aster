import { GenericModal } from "./Modals";
import ReactCrop, { type Crop } from "react-image-crop";
import { useRef, useState } from "react";
import "react-image-crop/dist/ReactCrop.css";

interface PhotoCropperProps {
  open: boolean;
  onClose: () => void;
  img: File | string | null;
  onCrop: (crop: File) => void;
}

export const PhotoCropper = ({
  open,
  onClose,
  img,
  onCrop,
}: PhotoCropperProps) => {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleCrop = () => {
    if (!imgRef.current || !crop || !crop.width || !crop.height) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Convert the canvas to a Blob and pass it onCrop
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedImage = new File([blob], "cropped.png", { type: "image/png" });
        onCrop(croppedImage);
      }
    }, "image/png");
    onClose();
  };

  return (
    <GenericModal
      open={open}
      onClose={onClose}
      title="Crop image"
      primaryButtonText="Crop"
      onPrimaryButtonClick={handleCrop}
    >
      <div className="flex items-center justify-center h-full w-full rounded-lg">
        <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={1}>
          <img src={img as string} alt="Logo" ref={imgRef} />
        </ReactCrop>
      </div>
    </GenericModal>
  );
};
