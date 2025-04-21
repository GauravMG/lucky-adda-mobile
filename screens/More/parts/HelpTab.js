import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../../context/ThemeContext';
import { getItem } from '../../../utils/storage';
import { fetchHelpData } from '../../../services/appService';
import telegramIcon from '../../../assets/telegram.png';
import whatsappIcon from '../../../assets/whatsapp.png';

const HelpTab = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [data, setData] = useState(null);

  const [userData, setUserData] = useState(null);
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const userData = await getItem('userData');
        setUserData(userData);
      };

      fetchUserData();
    }, [navigation])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { success, message, data } = await fetchHelpData();

      if (success) {
        setData(data);
      } else {
        Alert.alert(message);
      }
    } catch (error) {
      console.error('Failed to get help data:', error);
    }
  };

  const handleOpenTelegram = () => {
    const telegramNumber = data.find((item) => item.name === 'telegram')?.value;
    if (telegramNumber) {
      const url = `tg://resolve?domain=${telegramNumber}`;

      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            const webUrl = `https://t.me/${telegramNumber}`;
            return Linking.openURL(webUrl);
          }
        })
        .catch((err) => Alert.alert('Error', 'Could not open Telegram'));
    }
  };

  const handleOpenWhatsApp = () => {
    const whatsappNumber = data.find(
      (item) => item.name === 'whatsappNumber'
    )?.value;
    if (whatsappNumber) {
      const message = encodeURIComponent(
        `Name: ${userData?.fullName}\nMobile: ${userData?.mobile}\n\n`
      );
      const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${message}`;

      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            // Fallback to WhatsApp web if app is not installed
            const webUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
            return Linking.openURL(webUrl);
          }
        })
        .catch((err) => Alert.alert('Error', 'Could not open WhatsApp'));
    }
  };

  const handleCall = () => {
    const callNumber = data.find((item) => item.name === 'callNumber')?.value;
    if (callNumber) {
      const dialerUrl = `tel:${callNumber}`;
      Linking.openURL(dialerUrl).catch((err) =>
        Alert.alert('Failed to open dialer', err.message)
      );
    }
  };

  const renderButton = (onPress, text, icon) => (
    <TouchableOpacity
      style={[styles.helpButton, { backgroundColor: theme.button }]}
      onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={[styles.buttonText, { color: theme.buttonText }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Help</Text>

      {/* Telegram Button */}
      {renderButton(handleOpenTelegram, 'Chat on Telegram', telegramIcon)}

      {/* WhatsApp Button */}
      {renderButton(handleOpenWhatsApp, 'Chat on WhatsApp', whatsappIcon)}

      {/* Call Button */}
      {/* renderButton(handleCall, 'Call Us', callIcon) */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default HelpTab;
