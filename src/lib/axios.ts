import axios, { AxiosError } from "axios";
const API_URL = "https://api.realworld.io/api";
import store from "@/store";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Handle API errors
function handleApiError(error: AxiosError) {
  const { response, request } = error;

  if (response) {
    // The request was made, but the server responded with an error status code
    const { status, data } = response;
    console.error("API Error Status:", status);

    const errorsData = data?.errors;

    if (errorsData) {
      for (const key in errorsData) {
        if (Object.prototype.hasOwnProperty.call(errorsData, key)) {
          const errorMessages = errorsData[key];
          errorMessages.forEach((errorMessage: string) => {
            store.dispatch("addToast", {
              message: `${key} ${errorMessage}`,
              variant: "danger",
            });
          });
        }
      }
    } else {
      // Dispatch a general error message for other errors
      const errorMessage = data?.message || "An error occurred";
      store.dispatch("addToast", {
        message: errorMessage,
        variant: "danger",
      });
    }

    console.error("API Error Data:", data);
  } else if (request) {
    // The request was made, but no response was received (network error)
    console.error("API Request Error:", "No response received");
    // Dispatch a toast for network errors
    store.dispatch("addToast", {
      message: "Network error: Unable to reach the server",
      variant: "danger",
    });
  } else {
    // Something happened in setting up the request or sending it
    console.error("API Error:", error.message);
    store.dispatch("addToast", {
      message: "An error occurred: " + error.message,
      variant: "danger",
    });
  }
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get the token from local storage
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
