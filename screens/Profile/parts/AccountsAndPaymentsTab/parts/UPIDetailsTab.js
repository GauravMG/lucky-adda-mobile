import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../../../../context/ThemeContext';
import { getItem } from '../../../../../utils/storage';

const UPIDetailsTab = (props) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const accountType = 'upi';

  const [userBankDetailId, setUserBankDetailId] = useState(null);
  const [upiName, setUPIName] = useState(null);
  const [upiID, setUPIID] = useState(null);

  const [userData, setUserData] = useState(null);
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const userData = await getItem('userData');
        setUserData(userData);
      };

      fetchUserData();
      fetchUserBankDetail();
    }, [navigation])
  );

  const fetchUserBankDetail = async () => {
    try {
      const data = await props.fetchUserBankDetail({
        accountType,
      });

      if (data) {
        setUserBankDetailId(data.userBankDetailId);
        setUPIName(data.accountHolderName);
        setUPIID(data.accountNumber);
      }
    } catch (error) {
      console.error('Failed to fetch bank account details:', error);
    }
  };

  const saveUserBankDetail = async () => {
    try {
      const { success, message } = await props.saveUserBankDetail({
        userBankDetailId,
        accountType,
        accountHolderName: upiName,
        accountNumber: upiID,
      });

      await fetchUserBankDetail();
    } catch (error) {
      console.error('Failed to fetch bank account details:', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>UPI Details</Text>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>UPI Name</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter UPI name"
          placeholderTextColor={theme.text}
          value={upiName}
          onChangeText={setUPIName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>UPI ID</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter UPI ID"
          placeholderTextColor={theme.text}
          value={upiID}
          onChangeText={setUPIID}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={saveUserBankDetail}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Update Details
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

export default UPIDetailsTab;
