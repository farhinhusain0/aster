import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { getIntegrations, deleteIntegration } from "../calls/integrations";
import { useAxios } from "../hooks";
import {
  ConnectionType,
  ConnectRequest,
  Integration,
} from "@/types/Connections";

interface UseIntegrationsOptions
  extends Omit<
    UseQueryOptions<Integration[] | undefined>,
    "queryKey" | "queryFn"
  > {}

export const useIntegrations = (options: UseIntegrationsOptions = {}) => {
  const axios = useAxios();
  return useQuery({
    ...options,
    queryKey: [ConnectionType.Integration],
    queryFn: () => getIntegrations(axios),
  });
};

export const useCreateIntegration = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: ConnectRequest) =>
      axios.post(requestData.url!, requestData.body, requestData.config),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ConnectionType.Integration] });
    },
  });
};

export const useDeleteIntegration = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ConnectionType.Integration],
    mutationFn: (integrationId: string) =>
      deleteIntegration(axios, integrationId),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: [ConnectionType.Integration] }),
  });
};
