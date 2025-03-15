import { post } from './apiClient';

export const updateUser = async (params) => {
  try {
    return post('/user/update', params);
  } catch (error) {
    throw error;
  }
};
