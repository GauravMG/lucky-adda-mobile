import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../../context/ThemeContext';
import { useNotification } from '../../../context/NotificationContext';
import { getItem, setItem } from '../../../utils/storage';
import { updateUser } from '../../../services/userService';

const ChangePasswordTab = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [userData, setUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [passwordError, setPasswordError] = useState('');

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
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleUpdatePassword = async () => {
    if (
      (currentPassword ?? '').trim() === '' ||
      (password ?? '').trim() === '' ||
      (confirmPassword ?? '').trim() === ''
    ) {
      showNotification('error', 'Details Required!', `Please fill all fields.`);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const { success, message, data } = await updateUser({
        userId: userData.userId,
        currentPassword,
        password,
      });

      showNotification(
        success ? 'success' : 'error',
        success ? 'Password Updated!' : 'Cannot update password.',
        message
      );
      if (success) {
        await setItem('userData', data);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setPasswordError('');
      }
    } catch (error) {
      showNotification(
        'error',
        error.response.data.message,
        error.response.data.message
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Change Password</Text>

      {/* Current Password Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Current Password</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Current Password"
          placeholderTextColor={theme.text}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={true}
        />
      </View>

      {/* Password Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="New Password"
          placeholderTextColor={theme.text}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
      </View>

      {/* Confirm Password Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>
          Confirm Password
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={theme.text}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        />
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleUpdatePassword}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Update Password
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
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangePasswordTab;
