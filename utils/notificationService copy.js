import messaging from '@react-native-firebase/messaging';
// import PushNotification from 'react-native-push-notification';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

// 🔹 Setup Push Notification Channel (Required for Android)
// export function setupNotificationChannel() {
//     PushNotification.createChannel(
//         {
//             channelId: 'default-channel-id',
//             channelName: 'Default Channel',
//             channelDescription: 'A channel for default notifications', // 🔹 REQUIRED for Android 8.0+
//             importance: 4, // 🔹 HIGH: Required for visibility
//             vibrate: true,
//             playSound: true,
//             soundName: 'default',
//         },
//         (created) => console.log(`Channel created: ${created ? 'Success' : 'Already exists'}`)
//     );
// }

// 🔹 Request User Permission for Notifications
export async function requestUserPermission() {
    console.log(`Platform.OS:`, Platform.OS);
    
    if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        console.log(`iOS authStatus:`, authStatus);

        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            console.log('Notification permission granted.');
        } else {
            console.log('Permission Denied');
        }
    } else {
        console.log(`Checking POST_NOTIFICATIONS permission availability...`);
        
        if (!PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) {
            console.log(`POST_NOTIFICATIONS not available in this React Native version`);
            return;
        }

        console.log(`PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS:`, PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );

            console.log(`Permission Request Result:`, granted);

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Android notification permission granted.');
            } else {
                console.log('Android notification permission denied.');
            }
        } catch (error) {
            console.error('Permission request error:', error);
        }
    }
}

// 🔹 Get FCM Token
export async function getFcmToken() {
    try {
        if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
        }

        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
    }
}

// Show local notification
async function displayLocalNotification(remoteMessage) {
    await notifee.requestPermission();

    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
        },
    });
}

// 🔹 Notification Listeners
export function notificationListener() {
    // When notification is opened from background
    messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened from background:', remoteMessage);
    });

    // When the app is launched from a notification (quit state)
    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification opened from quit state:', remoteMessage);
            }
        });

    // Foreground notification handling
    messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground Notification:', remoteMessage);
        Alert.alert(remoteMessage.notification?.title, remoteMessage.notification?.body);

        // PushNotification.localNotification({
        //     channelId: 'default-channel-id', // Must match created channel
        //     title: remoteMessage.notification?.title,
        //     message: remoteMessage.notification?.body,
        //     playSound: true,
        //     soundName: 'default',
        //     priority: 'high',
        // });

        // await displayLocalNotification(remoteMessage);
    });

    // Background notification handling
    // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    //     console.log('Background Notification:', remoteMessage);

    //     PushNotification.localNotification({
    //         channelId: 'default-channel-id',
    //         title: remoteMessage.notification?.title,
    //         message: remoteMessage.notification?.body,
    //         playSound: true,
    //         soundName: 'default',
    //         priority: 'high',
    //     });
    // });
}
