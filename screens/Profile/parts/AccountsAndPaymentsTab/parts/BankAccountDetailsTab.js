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

const BankAccountDetailsTab = (props) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const accountType = 'bank_saving';

  const [userBankDetailId, setUserBankDetailId] = useState(null);
  const [beneficiaryName, setBeneficiaryName] = useState(null);
  const [accountNumber, setAccountNumber] = useState(null);
  const [bankName, setBankName] = useState(null);
  const [ifscCode, setIFSCCode] = useState(null);

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
        setBeneficiaryName(data.accountHolderName);
        setAccountNumber(data.accountNumber);
        setBankName(data.bankName);
        setIFSCCode(data.ifscCode);
      }
    } catch (error) {
      console.error('Failed to fetch bank account details:', error);
    }
  };

  const saveUserBankDetail = async () => {
    try {
      await props.saveUserBankDetail({
        userBankDetailId,
        accountType,
        accountHolderName: beneficiaryName,
        accountNumber,
        bankName,
        ifscCode,
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
      <Text style={[styles.title, { color: theme.text }]}>
        Bank Account Details
      </Text>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>
          Beneficiary Name
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter beneficiary name"
          placeholderTextColor={theme.text}
          value={beneficiaryName}
          onChangeText={setBeneficiaryName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Bank Name</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter bank name"
          placeholderTextColor={theme.text}
          value={bankName}
          onChangeText={setBankName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>
          Account Number
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter account number"
          placeholderTextColor={theme.text}
          value={accountNumber}
          onChangeText={setAccountNumber}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>IFSC Code</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter IFSC code"
          placeholderTextColor={theme.text}
          value={ifscCode}
          onChangeText={setIFSCCode}
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
    // flex: 1,
    // justifyContent: 'flex-start',
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

export default BankAccountDetailsTab;
