import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAllVendors } from "../calls/vendors";
import { useAxios } from "../hooks";
import { Vendor } from "@/types/Connections";

interface UseVendorsOptions extends Omit<UseQueryOptions<Vendor[] | undefined>, 'queryKey' | 'queryFn'> {}

export const useVendors = (options: UseVendorsOptions = {}) => {
  const axios = useAxios();
  return useQuery({
    ...options,
    queryKey: ["all-vendors"],
    queryFn: () => getAllVendors(axios),
  });
};
