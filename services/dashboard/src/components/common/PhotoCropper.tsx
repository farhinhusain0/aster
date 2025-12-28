import { GenericModal } from "./Modals";
import Avatar from "react-avatar-edit";
import { useState } from "react";

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
  // preview holds a base64 data URL returned by the avatar editor
  const [preview, setPreview] = useState<string | null>(null);

  const handleCrop = async () => {
    if (!preview) return;

    // convert base64 dataURL to Blob and then to File
    try {
      const res = await fetch(preview);
      const blob = await res.blob();
      const file = new File([blob], "cropped.png", {
        type: blob.type || "image/png",
      });
      onCrop(file);
    } catch (err) {
      console.error("Error converting cropped preview to file:", err);
    }

    onClose();
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  return (
    <GenericModal
      open={open}
      onClose={handleClose}
      title="Crop image"
      primaryButtonText="Crop"
      onPrimaryButtonClick={handleCrop}
    >
      {/* Using [&_svg]:hidden to hide the default close icon */}
      <div className="flex items-center justify-center h-full w-full rounded-lg [&_svg]:hidden">
        <Avatar
          width={400}
          height={400}
          onCrop={(previewDataUrl: string) => setPreview(previewDataUrl)}
          onClose={() => setPreview(null)}
          src={img as string}
          exportSize={400}
          exportMimeType={"image/png"}
          backgroundColor={"transparent"}
          exportAsSquare={true}
        />
      </div>
    </GenericModal>
  );
};
