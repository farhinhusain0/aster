import { AxiosInstance } from "axios";

export interface IFeatures {
  isInviteMembersEnabled: boolean;
}

export const getFeatures = async <T extends IFeatures>(
  axios: AxiosInstance,
) => {
  try {
    const response = await axios.get<T>("/features");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
