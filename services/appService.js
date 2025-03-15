import { post } from './apiClient';

export const fetchMaintenanceData = async (params) => {
  try {
    return post('/app-setting/list', params);
  } catch (error) {
    throw error;
  }
};

export const fetchHelpData = async (params) => {
  try {
    return post('/document/help-and-support', params);
  } catch (error) {
    throw error;
  }
};
