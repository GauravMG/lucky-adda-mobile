import axios from 'axios';

import { getItem, setItem, removeItem } from '../utils/storage';
import { navigate } from '../utils/navigation';

// Base API URL
const BASE_URL = 'https://lucky-adda.com/api/v1';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const jwtToken = await getItem('jwtToken');
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generic POST request function
export const post = async (url, data, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message;
      const errorCode = error.response?.data?.code;

      // If app shutdown by admin
      if (
        ['app_shutdown'].indexOf(errorMessage) >= 0 ||
        ['app_shutdown'].indexOf(errorCode) >= 0
      ) {
        await removeItem('jwtToken');
        await removeItem('userData');

        navigate('LoginScreen');
      }

      // If JWT expired error, try refreshing token and retrying the request
      if (['jwt malformed'].indexOf(errorMessage) >= 0) {
        await removeItem('jwtToken');
        await removeItem('userData');

        navigate('LoginScreen');
      }

      if (['jwt expired'].indexOf(errorMessage) >= 0) {
        try {
          const newJwtToken = await refreshToken(); // Get new JWT token
          console.log('JWT refreshed, retrying original request...');

          // Retry the original request with the new JWT token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
            },
          };

          const retryResponse = await apiClient.post(url, data, retryConfig);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Error refreshing JWT:', refreshError);

          await removeItem('jwtToken');
          await removeItem('userData');

          navigate('LoginScreen');
        }
      }

      // Log other Axios errors
      console.error(`POST ${url} failed:`, error.response?.data);
    } else {
      console.error(`POST ${url} failed:`, error);
    }

    throw error;
  }
};

// Helper function to refresh token
const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh-token', {}, {});
    const newJwtToken = response.data.jwtToken;

    await setItem('jwtToken', newJwtToken);

    return newJwtToken;
  } catch (error) {
    throw error;
  }
};

export default apiClient;
