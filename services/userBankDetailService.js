import { post } from './apiClient';

export const saveUserBankDetail = async (params) => {
  try {
    return post('/user-bank-detail/save', params);
  } catch (error) {
    throw error;
  }
};

export const listUserBankDetail = async (params) => {
  try {
    return post('/user-bank-detail/list', params);
  } catch (error) {
    throw error;
  }
};

export const deleteUserBankDetail = async (params) => {
  try {
    return post('/user-bank-detail/delete', params);
  } catch (error) {
    throw error;
  }
};
