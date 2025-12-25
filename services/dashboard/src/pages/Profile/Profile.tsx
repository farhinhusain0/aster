import { Input } from "@/components/base/input/input";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import Typography from "@/components/common/Typography";
import OrganizationContentContainer from "../Organization/components/OrganizationContentContainer";
import { Button } from "@/components/base/buttons/button";
import { invalidateMe, useMe } from "@/api/queries/auth";
import { useState } from "react";
import { useUpdateUserMutation } from "@/api/queries/users";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@/hooks/modal";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { AvatarUploader } from "@/components/common/AvatarUploader";
import useDocumentTitle from "@/hooks/documentTitle";

interface ProfileFormData {
  name: string;
  picture: File | null;
}

export default function ProfilePage() {
  useDocumentTitle("Profile | Aster");
  const changePasswordModalDisclosure = useDisclosure();
  const queryClient = useQueryClient();
  const userUpdateMutation = useUpdateUserMutation();
  const { data: user } = useMe();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.profile.name || "",
    picture: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { name, picture } = formData;

  const isFormDataInvalid =
    !name || (name.trim() === user?.profile.name.trim() && picture === null);

  const handleUpdateUser = async () => {
    const promise = userUpdateMutation.mutateAsync(
      {
        id: user?._id!,
        name: name,
        picture: picture,
      },
      {
        onSuccess: () => {
          invalidateMe(queryClient);
          setFormData((prev) => ({
            ...prev,
            picture: null,
          }));
        },
      },
    );
    toast.promise(promise, {
      loading: "Updating profile...",
      success: "Profile updated.",
      error: "Profile update failed.",
    });
    await promise;
  };

  const handleResetForm = () => {
    setFormData({
      ...formData,
      picture: null,
    });
    setPreviewUrl(null);
  };

  const isSaveButtonDisabled =
    isFormDataInvalid || userUpdateMutation.isPending;

  return (
    <OrganizationContentContainer title="Profile">
      <ContentContainerCard>
        <ContentContainerCard.Content>
          <div className="flex flex-row gap-4 items-center">
            <div>
              <AvatarUploader
                variant="profile"
                initialAvatarUrl={user?.profile.picture || ""}
                onFileSelect={(file: File | null) => {
                  setFormData((prev) => ({ ...prev, picture: file }));
                  setPreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
                previewUrl={previewUrl}
              />
            </div>

            <div>
              <Input
                label="Full name"
                aria-label="User's Full Name Input"
                aria-labelledby="User's Full Name Input"
                size="sm"
                value={name}
                onChange={(value) => setFormData({ ...formData, name: value })}
              />
            </div>
          </div>
        </ContentContainerCard.Content>
        <ContentContainerCard.Footer>
          {!isFormDataInvalid && (
            <Button color="secondary" onClick={handleResetForm}>
              Cancel
            </Button>
          )}
          <Button
            isDisabled={isSaveButtonDisabled}
            isLoading={userUpdateMutation.isPending}
            onClick={handleUpdateUser}
          >
            Save
          </Button>
        </ContentContainerCard.Footer>
      </ContentContainerCard>

      <ContentContainerCard>
        <ContentContainerCard.Content>
          <div className="flex flex-row gap-8 justify-between">
            <Typography
              variant="md/medium"
              className="text-secondary max-w-[276px] w-full"
            >
              Password
            </Typography>

            <Button
              size="sm"
              color="link-color"
              onClick={changePasswordModalDisclosure.onOpen}
            >
              Change password
            </Button>
          </div>
        </ContentContainerCard.Content>
      </ContentContainerCard>

      <ChangePasswordModal
        open={changePasswordModalDisclosure.isOpen}
        onClose={changePasswordModalDisclosure.onClose}
      />
    </OrganizationContentContainer>
  );
}
