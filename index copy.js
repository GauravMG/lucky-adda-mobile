import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import App from './App';
import { name as appName } from './app.json';
import { setupNotificationChannel } from './utils/notificationService';

// ✅ Ensure Notification Channel is created
setupNotificationChannel();

// 🔹 Background Notification Handler (Important for React Native)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background Notification:', remoteMessage);
    PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body,
        playSound: true,
        soundName: 'default',
        priority: 'high',
    });
});

// ✅ Register the App
AppRegistry.registerComponent(appName, () => App);
