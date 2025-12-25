import { AxiosInstance } from "axios";
import { IInvestigation } from "@/types/Investigtion";

export interface GetInvestigationsReturn {
  investigations: IInvestigation[];
  total: number;
  limit: number;
  offset: number;
}
export const getInvestigations = async (
  axios: AxiosInstance,
  limit?: number,
  offset?: number,
) => {
  try {
    const response = await axios.get<GetInvestigationsReturn>(
      "/investigations",
      {
        params: {
          limit,
          offset,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log("getInvestigations error: ", error);
    throw error;
  }
};

export const getInvestigation = async (axios: AxiosInstance, id: string) => {
  try {
    const response = await axios.get(`/investigations/${id}`);
    return response.data;
  } catch (error) {
    console.log("getInvestigations error: ", error);
    throw error;
  }
};
