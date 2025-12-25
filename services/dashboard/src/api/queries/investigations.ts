import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAxios } from "../hooks";
import {
  getInvestigation,
  getInvestigations,
  GetInvestigationsReturn,
} from "../calls/investigations";

interface UseInvestigationQueryOptions
  extends Omit<
    UseQueryOptions<GetInvestigationsReturn | undefined>,
    "queryKey" | "queryFn"
  > {}
interface UseInvestigationsOptions {
  limit?: number;
  offset?: number;
  options?: UseInvestigationQueryOptions;
}
export const useInvestigations = ({
  limit,
  offset,
  options,
}: UseInvestigationsOptions = {}) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["investigations", limit, offset],
    queryFn: () => getInvestigations(axios, limit, offset),
    ...options,
  });
};

export const useInvestigation = (id: string) => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["investigations", id],
    queryFn: () => getInvestigation(axios, id),
  });
};
