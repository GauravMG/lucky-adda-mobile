import React, { useState, useEffect } from "react"
import { AppRegistry } from 'react-native';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

import App from './App';
import { name as appName } from './app.json';

const MainApp = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const registerFirebase = async () => {
      const firebaseConfig = {
        apiKey: "AIzaSyCD6cbQU95pjdMp9XoGpyaLijuCs5chIBc",
        authDomain: "lucky-adda-66b1e.firebaseapp.com",
        projectId: "lucky-adda-66b1e",
        storageBucket: "lucky-adda-66b1e.appspot.com",
        messagingSenderId: "447950015534",
        appId: "1:447950015534:android:55d66138baf50dd434e3bf",
        databaseURL: "https://lucky-adda-66b1e-default-rtdb.asia-southeast1.firebasedatabase.app/", // Firebase Realtime Database URL
      };


      try {
        if (!firebase.apps.length) {
          await firebase.initializeApp(firebaseConfig);
          console.log("🔥 Firebase Initialized Successfully");
        }
        registerBackgroundMessage();
      } catch (error) {
        console.error("❌ Firebase Initialization Error:", error);
      } finally {
        setLoading(false);
      }
    };

    registerFirebase();
  }, []);

  // Register background message handler
  const registerBackgroundMessage = () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📩 Message handled in the background!', remoteMessage);

      try {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'No Title',
          body: remoteMessage.notification?.body || 'No Body',
          android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
          },
        });
      } catch (error) {
        console.error('Error displaying background notification:', error);
      }
    });
  };

  return !loading ? <App /> : null;
};

// ✅ Register the App
AppRegistry.registerComponent(appName, () => MainApp);
