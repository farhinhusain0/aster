import { AxiosInstance } from "axios";
import type { IOrganization } from "./organizations";

export interface IProfile {
  _id: string;
  name: string;
  picture: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  organization: IOrganization;
  createdAt: Date;
  updatedAt: Date;
  profile: IProfile;
}

export interface IUsers {
  users: IUser[];
}

export const getUser = async (axios: AxiosInstance) => {
  try {
    const response = await axios.get<IUser>("/users/me");
    return response.data as IUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export interface IEnrichedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  picture: string;
}

export interface IEnrichedUsers {
  users: IEnrichedUser[];
}

export const getOrgUsers = async (
  axios: AxiosInstance,
  organizationId: string,
) => {
  try {
    const response = await axios.get<IEnrichedUsers>(
      `/users?organizationId=${organizationId}`,
    );
    return response.data as IEnrichedUsers;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateUser = async (
  axios: AxiosInstance,
  data: { id: string; name: string; picture: File | null },
) => {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.picture) {
      formData.append("picture", data.picture);
    }

    const response = await axios.put(`/users/${data.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const changePassword = async (
  axios: AxiosInstance,
  data: { currentPassword: string; newPassword: string },
) => {
  try {
    const response = await axios.post(`/users/change-password`, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUser = async (axios: AxiosInstance, id: string) => {
  try {
    const response = await axios.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const changeRole = async (
  axios: AxiosInstance,
  data: { id: string; role: string },
) => {
  try {
    const response = await axios.put(`/users/${data.id}`, { role: data.role });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};