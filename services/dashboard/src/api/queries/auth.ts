import { getUser } from "../calls/users";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { useAxios } from "../hooks";
import { IUser } from "../calls/users";

export const useMe = <T = IUser>() => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["me"],
    queryFn: () => getUser(axios) as Promise<T>,
  });
};

export const invalidateMe = (queryClient: QueryClient) => {
  if (!queryClient) {
    return;
  }
  queryClient.invalidateQueries({ queryKey: ["me"] });
};
