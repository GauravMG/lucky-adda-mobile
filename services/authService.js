import { post } from './apiClient';

export const sendOTP = async (params) => {
  try {
    return post('/auth/send-otp', params);
  } catch (error) {
    throw error;
  }
};

export const signInWithOTP = async (params) => {
  try {
    return post('/auth/sign-in-with-otp', params);
  } catch (error) {
    throw error;
  }
};

export const logout = async (params) => {
  try {
    return post('/auth/logout', params);
  } catch (error) {
    throw error;
  }
};
