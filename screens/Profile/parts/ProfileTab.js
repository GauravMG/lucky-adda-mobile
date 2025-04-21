import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../../../context/ThemeContext';
import { useNotification } from '../../../context/NotificationContext';
import { getItem, setItem } from '../../../utils/storage';
import { updateUser } from '../../../services/userService';

const ProfileTab = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [userData, setUserData] = useState(null);
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const userData = await getItem('userData');
        setUserData(userData);
        setMobile(userData?.mobile || '');
        setFullName(userData?.fullName || '');
        setDob(userData?.dob ? new Date(userData.dob) : null);
      };

      fetchUserData();
    }, [navigation])
  );

  const handleUpdateProfile = async () => {
    if ((fullName ?? '').trim() === '' || !dob) {
      showNotification('error', 'Details Required!', `Please fill all fields.`);
      return;
    }

    if (
      fullName.trim() === (userData.fullName ?? '').trim() &&
      dob.toISOString() === userData.dob
    ) {
      showNotification('error', 'No Changes!', `No changes to be updated.`);
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
      showNotification(
        'error',
        'Invalid Age!',
        `You must be at least 18 years old to register.`
      );
      return;
    }

    try {
      const { success, message, data } = await updateUser({
        userId: userData.userId,
        fullName,
        dob,
      });

      showNotification(
        success ? 'success' : 'error',
        success ? 'Profile Updated!' : 'Cannot update profile.',
        message
      );
      if (success) {
        setUserData(data);
        await setItem('userData', data);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>My Profile</Text>

      {/* Mobile Number (Non-editable) */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Mobile Number</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          value={mobile}
          editable={false}
        />
      </View>

      {/* Full Name */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter your full name"
          placeholderTextColor={theme.text}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Date of Birth Picker */}
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

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleUpdateProfile}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Update Profile
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
});

export default ProfileTab;
