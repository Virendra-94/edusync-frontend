import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://edusyncvirendrabackend-g2gyedfxasagg2dt.centralindia-01.azurewebsites.net//api",
  headers: {
    "Content-Type": "application/json",
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
  // Add withCredentials to handle cookies if needed
  withCredentials: true
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      throw new Error("Unable to connect to the server. Please check if the server is running.");
    }
    if (error.code === "ERR_CERT_AUTHORITY_INVALID") {
      throw new Error("SSL certificate validation failed. This is normal in development. Please proceed.");
    }
    throw error;
  }
);

export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (data) => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw error;
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from server. Please try again.");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error setting up the request. Please try again.");
    }
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forget-password", { email });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email, token, newPassword) => {
  try {
    const res = await api.post("/auth/reset-password", {
      email,
      token,
      newPassword,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
