import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getFeatures } from "../calls/features";
import { useAxios } from "../hooks";
import { IFeatures } from "../calls/features";

export const useFeatures = <T extends IFeatures>(): UseQueryResult<T> => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["features"],
    queryFn: () => getFeatures<T>(axios),
  });
};
