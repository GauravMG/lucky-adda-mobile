import { post } from './apiClient';

export const createPaymentTransaction = async (params) => {
  try {
    return post('/payment/create', params);
  } catch (error) {
    throw error;
  }
};

export const updatePaymentTransaction = async (params) => {
  try {
    return post('/payment/update', params);
  } catch (error) {
    throw error;
  }
};
