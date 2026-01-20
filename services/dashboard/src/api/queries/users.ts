import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "../hooks";
import {
  deleteUser,
  getOrgUsers,
  changeRole,
  updateUser,
  changePassword,
  logout,
  validateToken,
} from "../calls/users";

export const useOrgUsers = (organizationId: string | undefined) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["orgUsers"],
    queryFn: async () => getOrgUsers(axios, organizationId!),
    enabled: !!organizationId,
  });
};

export const useUpdateUserMutation = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["updateUser"],
    mutationFn: async (data: {
      id: string;
      name: string;
      picture: File | null;
    }) => updateUser(axios, data),
  });
};

export const useChangePasswordMutation = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["changePassword"],
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(axios, data),
  });
};

export const useDeleteUser = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["deleteUser"],
    mutationFn: async (id: string) => deleteUser(axios, id),
  });
};

export const useChangeRole = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["changeRole"],
    mutationFn: async (data: { id: string; role: string }) =>
      changeRole(axios, data),
  });
};

export const useLogout = () => {
  const axios = useAxios();
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => logout(axios),
  });
};

export const useValidateToken = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["validateToken"],
    queryFn: async () => validateToken(axios),
    retry: false,
  });
};
