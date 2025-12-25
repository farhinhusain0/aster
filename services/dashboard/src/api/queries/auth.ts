import { getUser } from "../calls/users";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { useAxios } from "../hooks";

export const useMe = () => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["me"],
    queryFn: () => getUser(axios),
  });
};

export const invalidateMe = (queryClient: QueryClient ) => {
  if (!queryClient) {
    return;
  }
  queryClient.invalidateQueries({ queryKey: ["me"] });
};