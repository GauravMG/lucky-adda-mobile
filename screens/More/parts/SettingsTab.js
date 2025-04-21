import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  useNavigation,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';

import { useTheme } from '../../../context/ThemeContext';
import { getItem, setItem, removeItem } from '../../../utils/storage';
import { logout } from '../../../services/authService';
import { updateUser } from '../../../services/userService';

const SettingsTab = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const navigation = useNavigation();

  const toggleNotificationSwitch = () =>
    setIsNotificationsOn((prevState) => !prevState);

  const [isNotificationsOn, setIsNotificationsOn] = useState(false);

  const [userData, setUserData] = useState(null);
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const userData = await getItem('userData');
        setUserData(userData);
        setIsNotificationsOn(userData.isNotificationsOn ?? true);
      };

      fetchUserData();
    }, [navigation])
  );

  const handleUpdateProfile = async () => {
    try {
      const { success, message, data } = await updateUser({
        userId: userData.userId,
        isNotificationsOn: !isNotificationsOn,
      });

      if (success) {
        toggleNotificationSwitch();
        setUserData(data);
        await setItem('userData', data);
      } else {
        Alert.alert(message);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { success } = await logout();
      if (success) {
        await removeItem('jwtToken');
        await removeItem('userData');

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }], // Navigate to LoginScreen
          })
        );
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      {/* Notifications Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Notifications</Text>
        <Switch
          trackColor={{ false: '#767577', true: theme.toggleBackground }}
          thumbColor={isNotificationsOn ? theme.button : theme.buttonText}
          onValueChange={handleUpdateProfile}
          value={isNotificationsOn}
        />
      </View>

      {/* Theme Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Theme</Text>
        <Switch
          trackColor={{ false: '#767577', true: theme.toggleBackground }}
          thumbColor={isDarkMode ? theme.button : theme.buttonText}
          onValueChange={toggleTheme}
          value={isDarkMode}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Logout
        </Text>
      </TouchableOpacity>
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsTab;
