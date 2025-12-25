import axios from "axios";
import { API_SERVER_URL } from "../../constants";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

interface LoginResponse {
  token: string;
  user: {
    email: string;
    // Add other user properties as needed
  };
}

interface RegisterResponse {
  success: boolean;
}

interface VerifyRegistrationResponse {
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/users/login/`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(`Login failed: ${error}`);
      throw error;
    }
  },

  register: async (
    credentials: RegisterCredentials,
  ): Promise<RegisterResponse> => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/users/register/`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(`Registration failed: ${error}`);
      throw error;
    }
  },

  verifyRegistration: async ({
    token,
  }: {
    token: string;
  }): Promise<VerifyRegistrationResponse> => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/users/verify-registration/`,
        { token },
      );
      return response.data;
    } catch (error) {
      console.log(`Verify registration failed: ${error}`);
      throw error;
    }
  },

  forgotPassword: async (data: { email: string }) => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/users/forgot-password`,
        data,
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    try {
      const response = await axios.post(
        `${API_SERVER_URL}/users/reset-password`,
        data,
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
