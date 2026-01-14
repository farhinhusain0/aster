import { useUpdateOrg } from "@/api/queries/organizations";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { AvatarUploader } from "@/components/common/AvatarUploader";

export const InformationCard = ({ organization }: any) => {
  const queryClient = useQueryClient();

  const [orgFormData, setOrgFormData] = useState(
    organization
      ? {
          name: organization.name,
        }
      : {},
  );

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<
    File | string | null
  >(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutateAsync: updateOrganization, isPending } = useUpdateOrg();

  const submitForm = async () => {
    const { name } = orgFormData;

    if (!name || (name === organization.name && selectedAvatarFile === null)) {
      return;
    }

    const promise = updateOrganization(
      {
        data: { name },
        logo: selectedAvatarFile || organization.logo,
        organizationId: organization._id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["me"] });
          setSelectedAvatarFile(null);
        },
      },
    );

    toast.promise(promise, {
      loading: "Settings updating.",
      success: "Settings updated.",
      error: "Update failed.",
    });

    await promise;
  };

  const handleResetForm = () => {
    setOrgFormData({
      name: organization.name,
    });
    setSelectedAvatarFile(null);
    setPreviewUrl(null);
  };

  const isSaveButtonDisabled =
    isPending ||
    !orgFormData.name ||
    (orgFormData.name.trim() === organization.name.trim() &&
      selectedAvatarFile === null);

  return (
    <ContentContainerCard>
      <ContentContainerCard.Content>
        <div className="flex flex-row gap-4 items-center">
          <div>
            <AvatarUploader
              variant="organization"
              initialAvatarUrl={organization.logo || ""}
              onFileSelect={(file: File | null) => {
                setSelectedAvatarFile(file);
                setPreviewUrl(file ? URL.createObjectURL(file) : null);
              }}
              previewUrl={previewUrl}
            />
          </div>

          <div>
            <Input
              label="Organization name"
              aria-label="Organization Name Input"
              aria-labelledby="Organization Name Input"
              size="sm"
              value={orgFormData.name}
              onChange={(value: string) =>
                setOrgFormData((prev) => ({
                  ...prev,
                  name: value,
                }))
              }
            />
          </div>
        </div>
      </ContentContainerCard.Content>
      <ContentContainerCard.Footer>
        {!isSaveButtonDisabled && (
          <Button color="secondary" onClick={handleResetForm}>
            Cancel
          </Button>
        )}
        <Button
          isDisabled={isSaveButtonDisabled}
          onClick={async () => await submitForm()}
        >
          Save
        </Button>
      </ContentContainerCard.Footer>
    </ContentContainerCard>
  );
};
