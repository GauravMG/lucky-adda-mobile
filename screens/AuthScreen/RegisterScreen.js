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
import DateTimePicker from '@react-native-community/datetimepicker'; // Date picker library

import { useTheme } from '../../context/ThemeContext';
import { AppLogo } from '../../App';
import { getItem, setItem } from '../../utils/storage';
import { updateUser } from '../../services/userService';

const RegisterScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [userData, setUserData] = useState(null);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [referredByCode, setReferredByCode] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          const jwtToken = await getItem('jwtToken');
          const userData = await getItem('userData');
          setUserData(userData);

          if (jwtToken) {
            if (userData?.isPersonalInfoCompleted) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'HomeScreen' }],
                })
              );
            }
          }
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
      (fullName ?? '').trim() === '' ||
      !dob ||
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

    // Calculate age
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if birth date hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 18) {
      Alert.alert('You must be at least 18 years old to register.');
      return;
    }

    try {
      // setLoading(true);
      const { success, message, data } = await updateUser({
        userId: userData.userId,
        fullName,
        dob,
        password,
        referredByCode,
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
      <Text style={[styles.title, { color: theme.text }]}>Register</Text>

      {/* Full Name Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Full Name"
          placeholderTextColor={theme.text}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Date of Birth Picker with Label */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Date of Birth</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={[
            styles.input,
            styles.datePicker,
            { backgroundColor: theme.card },
          ]}>
          <Text style={{ color: dob ? theme.text : '#888' }}>
            {dob ? dob.toDateString() : 'Select DOB'}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={dob || new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDob(selectedDate);
          }}
        />
      )}

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

      {/* Referral Code Input with Label */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>
          Referral Code (if any)
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Referral Code"
          placeholderTextColor={theme.text}
          value={referredByCode}
          onChangeText={setReferredByCode}
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleRegister}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Register
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
  datePicker: {
    justifyContent: 'center',
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
  },
});

export default RegisterScreen;
