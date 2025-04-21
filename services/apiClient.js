import axios from 'axios';
import { Platform, Alert, PermissionsAndroid, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

import { getItem, setItem, removeItem } from '../utils/storage';
import { navigate } from '../utils/navigation';

// Base API URL
const BASE_URL = 'https://lucky-adda.com/api/v1';
const APP_VERSION = "2.0.0"
const DEVICE_TYPE = Platform.OS

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
    config.headers.versionnumber = APP_VERSION
    config.headers.devicetype = DEVICE_TYPE
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

const installAPK = async (path) => {
  try {
    await FileViewer.open(path, { showOpenWithDialog: true });
    console.log('APK opened for install');
  } catch (error) {
    console.error('Failed to open APK:', error);
  }
};

const handleAppUpdate = async () => {
  try {
    Linking.openURL("https://lucky-adda.com");
    // const apkUrl = 'https://lucky-adda.com/lucky-adda.apk'; // replace with your URL
    // const apkFileName = 'lucky-adda.apk';
    // const destPath = `${RNFS.DownloadDirectoryPath}/${apkFileName}`;

    // if (Platform.OS === 'android') {
    //   const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    //   );

    //   if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //     console.log('Storage permission not granted');
    //     return;
    //   }
    // }

    // const download = RNFS.downloadFile({
    //   fromUrl: apkUrl,
    //   toFile: destPath,
    // });

    // const result = await download.promise;
    // if (result.statusCode === 200) {
    //   console.log('Download complete:', destPath);

    //   // Now open the downloaded APK
    //   installAPK(destPath);
    // } else {
    //   console.log('Download failed');
    // }
  } catch (error) {
    console.error('Error updating app:', error);
  }
};

let isUpdateAlertShown = false;

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

      // If update available
      if (
        !isUpdateAlertShown &&
        (
          ['update_available'].indexOf(errorMessage) >= 0 ||
          ['update_available'].indexOf(errorCode) >= 0
        )
      ) {
        isUpdateAlertShown = true;

        Alert.alert(
          "Update Available!",
          "Please update the app.",
          [
            {
              text: "Update",
              onPress: () => {
                handleAppUpdate();
                isUpdateAlertShown = false; // Optional: reset after pressing update
              },
            },
          ],
          { cancelable: false }
        );
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
      throw error.response?.data
    } else {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
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
