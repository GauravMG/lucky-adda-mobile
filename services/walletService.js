import { post } from './apiClient';

export const fetchWalletList = async (params) => {
  try {
    return post('/wallet/list', params);
  } catch (error) {
    throw error;
  }
};

export const addWalletTransaction = async (params) => {
  try {
    return post('/wallet/create', params);
  } catch (error) {
    throw error;
  }
};

export const convertAmount = async (params) => {
  try {
    return post('/wallet/convert-winning', params);
  } catch (error) {
    throw error;
  }
};

export const fetchTopWinners = async (params) => {
  try {
    return post('/wallet/top-winner', params);
  } catch (error) {
    throw error;
  }
};
