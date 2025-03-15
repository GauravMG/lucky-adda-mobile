import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from 'react-native';
import {
  useNavigation,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import { useTheme } from '../../context/ThemeContext';
import { sendOTP, signInWithOTP } from '../../services/authService';
import { setItem, getItem } from '../../utils/storage';
import { AppLogo } from '../../App';
import { checkMaintenance } from '../../hooks/checkMaintenance';
import { getFcmToken } from '../../utils/notificationService';

const LoginScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [appMaintenanceData, setAppMaintenanceData] = useState(null);
  const [mobile, setMobile] = useState('');
  const [isResend, setIsResend] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isPersonalInfoCompleted, setIsPersonalInfoCompleted] = useState(false);
  const [password, setPassword] = useState('');
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          const jwtToken = await getItem('jwtToken');
          const userData = await getItem('userData');

          if (jwtToken) {
            if (!userData?.isPersonalInfoCompleted) {
              navigation.navigate('RegisterScreen');
            } else {
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

      const verifyMaintenance = async () => {
        const newAppMaintenanceData = await checkMaintenance();
        setAppMaintenanceData(newAppMaintenanceData);

        if (!newAppMaintenanceData.isAppShutdown) {
          checkAuth();
        }
      };

      verifyMaintenance();
    }, [navigation])
  );

  useEffect(() => {
    setIsResend(false);

    setIsForgotPassword(false);

    setIsPersonalInfoCompleted(false);
    setPassword('');

    setShowOtpFields(false);
    setOtp(['', '', '', '', '', '']);
  }, [mobile]);

  const getDeviceDetails = async () => {
    const deviceType = Platform.OS; // 'ios' or 'android'
    const deviceId = await DeviceInfo.getUniqueId(); // Unique device ID
    // const deviceId = '';

    return { deviceType, deviceId };
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (value, index) => {
    if (!value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      Alert.alert('Please enter a valid 10-digit mobile number.');
      return false;
    }

    // Clear OTP fields
    setOtp(['', '', '', '', '', '']);

    try {
      // setLoading(true);
      const { success, message, metadata, data } = await sendOTP({
        mobile,
        verificationType: 'login_otp',
        isResend,
      });

      if (success) {
        setIsPersonalInfoCompleted(data.isPersonalInfoCompleted);

        if (!data.isPersonalInfoCompleted) {
          Alert.alert(`OTP ${isResend ? 'Resent' : 'Sent'}`, message);
          setShowOtpFields(true);

          // Ensure focus is set to the first OTP input field
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 100);

          setIsResend(true);
        } else {
          setShowOtpFields(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setPassword('');
    if (mobile.length !== 10) {
      Alert.alert('Please enter a valid 10-digit mobile number.');
      return false;
    }

    // Clear OTP fields
    setOtp(['', '', '', '', '', '']);

    try {
      // setLoading(true);
      const { success, message, metadata, data } = await sendOTP({
        mobile,
        verificationType: 'login_otp',
        isResend,
        isForgotPassword: true,
      });

      if (success) {
        setIsForgotPassword(true);
        setIsPersonalInfoCompleted(false);

        Alert.alert(`OTP ${isResend ? 'Resent' : 'Sent'}`, message);
        setShowOtpFields(true);

        // Ensure focus is set to the first OTP input field
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);

        setIsResend(true);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (!isPersonalInfoCompleted && enteredOtp.length !== 6) {
      Alert.alert('Please enter a valid 6-digit OTP.');
      return false;
    } else if (isPersonalInfoCompleted && (password ?? '').trim() === '') {
      Alert.alert('Please enter Password.');
      return false;
    }

    try {
      // setLoading(true);

      const fcmToken = await getFcmToken();
      // const fcmToken = '';

      const { success, message, jwtToken, data } = await signInWithOTP({
        mobile,
        otp: enteredOtp,
        password,
        ...(await getDeviceDetails()),
        fcmToken: fcmToken ?? '',
      });

      if (success) {
        await setItem('jwtToken', jwtToken);
        await setItem('userData', data);

        if (isForgotPassword) {
          navigation.navigate('Forgot Password');
        } else if (!data?.isPersonalInfoCompleted) {
          navigation.navigate('Register');
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }],
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert(`Invalid ${isPersonalInfoCompleted ? 'Password' : 'OTP'}`);
      // setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  return appMaintenanceData?.isAppShutdown ? (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        {appMaintenanceData?.appShutDownMessage}
      </Text>
    </View>
  ) : (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppLogo
        logoStyles={{
          width: 100,
          height: 100,
          marginBottom: 50,
          borderRadius: 8,
        }}
      />
      <Text style={[styles.title, { color: theme.text }]}>Login</Text>

      {/* Mobile Number Input */}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
        placeholder="Please enter mobile number"
        placeholderTextColor={theme.text}
        keyboardType="phone-pad"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
      />

      {/* Send OTP Button */}
      {!showOtpFields && !isPersonalInfoCompleted && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={handleSendOtp}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Verify
          </Text>
        </TouchableOpacity>
      )}

      {/* OTP Input Fields (Only shown after sending OTP) */}
      {isPersonalInfoCompleted ? (
        <>
          {/* Password Field */}
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.card, color: theme.text },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={theme.text}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button for Password */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleVerifyOtp}>
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Login
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Button (Below Login Button) */}
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={[styles.resendOtp, { color: theme.text }]}>
              Forgot Password
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        showOtpFields && (
          <>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    { backgroundColor: theme.card, color: theme.text },
                  ]}
                  keyboardType="number-pad"
                  placeholderTextColor={theme.text}
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      handleBackspace(digit, index);
                    }
                  }}
                />
              ))}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button }]}
              onPress={handleVerifyOtp}>
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                Login
              </Text>
            </TouchableOpacity>

            {/* Resend OTP Button (Below Login Button) */}
            {isForgotPassword ? (
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={[styles.resendOtp, { color: theme.text }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSendOtp}>
                <Text style={[styles.resendOtp, { color: theme.text }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'left',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  resendOtp: {
    fontSize: 16,
    marginTop: 15,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
