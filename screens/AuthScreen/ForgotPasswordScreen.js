import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  useNavigation,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { AppLogo } from '../../App';
import { getItem, setItem } from '../../utils/storage';
import { updateUser } from '../../services/userService';

const ForgotPasswordScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          const userData = await getItem('userData');
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching JWT Token:', error);
        }
      };

      checkAuth();
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

  const handleRegister = async () => {
    if (
      (password ?? '').trim() === '' ||
      (confirmPassword ?? '').trim() === ''
    ) {
      Alert.alert('Please fill all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      // setLoading(true);
      const { success, message, data } = await updateUser({
        userId: userData.userId,
        password,
      });

      if (success) {
        await setItem('userData', data);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'HomeScreen' }],
          })
        );
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        <AppLogo
          logoStyles={{
            width: 100,
            height: 100,
            marginBottom: 20,
            borderRadius: 8,
          }}
        />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Forgot Password</Text>

      {/* Password Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Password"
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

      {/* Update Password Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleRegister}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Update Password
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 70,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
