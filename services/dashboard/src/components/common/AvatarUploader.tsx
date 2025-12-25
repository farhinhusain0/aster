import { Avatar } from "@/components/base/avatar/avatar";
import React, { useRef, useState } from "react";
import { Globe02, User01 } from "@untitledui/icons";
import { AvatarAddButton } from "../base/avatar/base-components";
import { PhotoCropper } from "./PhotoCropper";
import { useDisclosure } from "@/hooks/modal";

interface AvatarUploaderProps {
  initialAvatarUrl: string;
  onFileSelect: (file: File | null) => void;
  variant: "profile" | "organization";
  previewUrl: string | null;
}

export const AvatarUploader = ({
  initialAvatarUrl,
  onFileSelect,
  variant,
  previewUrl,
}: AvatarUploaderProps) => {
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen: isCropperOpen,
    setIsOpen: setCropperOpen,
    shouldRender: shouldRenderCropper,
  } = useDisclosure();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedAvatarFile(file);
      setCropperOpen(true);
    } else {
      setSelectedAvatarFile(null);
      onFileSelect(null);
    }
  };

  const handleCrop = (crop: File) => {
    onFileSelect(crop);
    setCropperOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="relative inline-block group">
        <Avatar
          size="2xl"
          className="h-20 w-20"
          src={previewUrl || initialAvatarUrl}
          placeholderIcon={variant === "profile" ? User01 : Globe02}
        />

        <div className="absolute inset-0.5 flex items-end justify-end">
          <AvatarAddButton
            size="xs"
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
      </div>

      {shouldRenderCropper && selectedAvatarFile && (
        <PhotoCropper
          open={isCropperOpen}
          onClose={() => setCropperOpen(false)}
          img={URL.createObjectURL(selectedAvatarFile)}
          onCrop={handleCrop}
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};
