import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: "https://payfromupi.com/api",
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 42|XNNpsZ9SSWR4PTI4ukYCyq2jI3aQm4qwBwOtc14Qd6e897ea'
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();
    const base = config.baseURL || '';
    const path = config.url || '';

    // Serialize params if any (for logging the full query string)
    const paramString = config.params ? `?${new URLSearchParams(config.params).toString()}` : '';
    const fullUrl = `${base}${path}${paramString}`;

    console.log(`\n--- API Request ---`);
    console.log(`URL: ${fullUrl}`);
    console.log(`Method: ${method}`);
    if (method === 'GET') {
      console.log(`Query Params:`, config.params || {});
    } else {
      console.log(`Body:`, config.data ? JSON.parse(config.data) : {});
    }
    console.log(`Headers:`, config.headers);
    console.log(`--------------------\n`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);
// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`\n+++ API Response +++`);
    console.log(`URL: ${response.config.baseURL}${response.config.url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Data:`, response.data);
    console.log(`++++++++++++++++++++\n`);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error(`\n*** API Error ***`);
      console.error(`URL: ${error.config?.baseURL}${error.config?.url}`);
      console.error(`Status: ${error.response?.status}`);
      console.error(`Error Data:`, error.response?.data);
      console.error(`******************\n`);
    } else {
      console.error("Unexpected error:", error);
    }
    return Promise.reject(error);
  }
);

// Generic POST request function
const get = async (url, data, config = {}) => {
  try {
    const response = await apiClient.get(url, { params: data }, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log other Axios errors
      console.error(`POST ${url} failed:`, error.response?.data);
    } else {
      console.error(`POST ${url} failed:`, error);
    }

    throw error;
  }
};

// Generic POST request function
const post = async (url, data, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log other Axios errors
      console.error(`POST ${url} failed:`, error.response?.data);
    } else {
      console.error(`POST ${url} failed:`, error);
    }

    throw error;
  }
};

export const checkPaymentStatus = async (data, config = {}) => {
  try {
    const response = await get('/check-payment-status', data, config);
    return response;
  } catch (error) {
    throw error;
  }
};
