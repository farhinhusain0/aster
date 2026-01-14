import { AxiosInstance } from "axios";

export interface IOrganization {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  domains: string[];
  logo: string;
}

export const createOrganization = async (
  axios: AxiosInstance,
  organization: any,
) => {
  try {
    const response = await axios.post<IOrganization>(
      "/organizations",
      organization,
    );
    return response.data;
  } catch (error) {
    console.log("createOrganization error: ", error);
    throw error;
  }
};

export const updateOrganization = async (
  axios: AxiosInstance,
  logo: File | null | undefined,
  organization: any,
  orgId: string,
) => {
  try {
    const formData = new FormData();

    // Add organization data to form data
    Object.keys(organization).forEach((key) => {
      formData.append(`organization[${key}]`, organization[key]);
    });

    // Add logo file if provided
    if (logo) {
      formData.append("logo", logo);
    }

    const response = await axios.put<IOrganization>(
      `/organizations/${orgId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log("updateOrganization error: ", error);
    throw error;
  }
};

export const deleteOrganization = async (
  axios: AxiosInstance,
  orgId: string,
) => {
  try {
    const response = await axios.delete<IOrganization>(
      `/organizations/${orgId}`,
    );
    return response.data;
  } catch (error) {
    console.log("deleteOrganization error: ", error);
    throw error;
  }
};

export const getUsage = async (axios: AxiosInstance, orgId: string) => {
  try {
    const response = await axios.get(`/organizations/${orgId}/usage`);
    return response.data;
  } catch (error) {
    console.log("getUsage error: ", error);
    throw error;
  }
};
