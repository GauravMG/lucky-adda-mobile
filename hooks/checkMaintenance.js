import { Alert } from 'react-native';

import { fetchMaintenanceData } from '../services/appService';

export const checkMaintenance = async () => {
  try {
    const { success, message, data } = await fetchMaintenanceData();
    if (!success) {
      Alert.alert(message);
      throw new Error(message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
