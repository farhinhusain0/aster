import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "../hooks";
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
  getUsage,
} from "../calls/organizations";

export const useOrgUsage = (organizationId: string | undefined) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["getUsage"],
    queryFn: async () => getUsage(axios, organizationId!),
    enabled: !!organizationId,
  });
};

export const useCreateOrg = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["createOrganization"],
    mutationFn: (name: string) => createOrganization(axios, { name }),
  });
};

export const useUpdateOrg = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["updateOrganization"],
    mutationFn: ({
      name,
      logo,
      organizationId,
    }: {
      name: string;
      logo: File | null;
      organizationId: string;
    }) => updateOrganization(axios, logo, { name }, organizationId),
  });
};

export const useDeleteOrg = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["deleteOrganization"],
    mutationFn: (organizationId: string) =>
      deleteOrganization(axios, organizationId),
  });
};
