import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '../../../../context/ThemeContext';
import { useNotification } from '../../../../context/NotificationContext';
import UPIDetailsTab from './parts/UPIDetailsTab';
import BankAccountDetailsTab from './parts/BankAccountDetailsTab';
import {
  saveUserBankDetail,
  listUserBankDetail,
} from '../../../../services/userBankDetailService';

const AccountsAndPaymentsTab = () => {
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [activeTab, setActiveTab] = useState('UPI Details');

  const fetchUserBankDetail = async (filter) => {
    try {
      const { success, message, data } = await listUserBankDetail({
        filter,
        range: {
          page: 1,
          pageSize: 1,
        },
      });

      if (success) {
        return data[0];
      }
      Alert.alert(message);
      return null;
    } catch (error) {
      console.error('Failed to fetch bank account details:', error);
    }
  };

  const updateUserBankDetail = async (payload) => {
    try {
      if (['upi', 'bank_saving'].indexOf(payload?.accountType ?? '') < 0) {
        showNotification('error', 'Invalid Details!', `Invalid account type.`);
        return;
      }
      if ((payload?.accountHolderName ?? '').trim() === '') {
        showNotification(
          'error',
          'Invalid Details!',
          `Please enter valid ${
            payload.accountType === 'upi' ? 'name' : 'beneficiary name'
          }`
        );
        return;
      }
      if ((payload?.accountNumber ?? '').trim() === '') {
        showNotification(
          'error',
          'Invalid Details!',
          `Please enter valid ${
            payload.accountType === 'upi' ? 'UPI ID' : 'account number'
          }`
        );
        return;
      }
      if (payload.accountType === 'bank_saving') {
        if ((payload?.bankName ?? '').trim() === '') {
          showNotification(
            'error',
            'Invalid Details!',
            `Please enter valid bank name.`
          );
          return;
        }
        if ((payload?.ifscCode ?? '').trim() === '') {
          showNotification(
            'error',
            'Invalid Details!',
            `Please enter valid IFSC code.`
          );
          return;
        }
      }

      const { success, message, data } = await saveUserBankDetail({
        ...payload,
      });

      showNotification(
        success ? 'success' : 'error',
        success
          ? `${
              payload.accountType === 'upi' ? 'UPI' : 'Bank Account'
            } Details Updated!`
          : `Cannot update ${
              payload.accountType === 'upi' ? 'upi' : 'bank account'
            } details.`,
        message
      );
      return;
    } catch (error) {
      console.error('Failed to save bank account details:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'UPI Details' && styles.activeTab,
            activeTab === 'UPI Details' && { borderBottomColor: theme.button },
          ]}
          onPress={() => setActiveTab('UPI Details')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'UPI Details' && styles.activeTabText,
              { color: theme.text },
            ]}>
            UPI Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Bank Account Details' && styles.activeTab,
            activeTab === 'Bank Account Details' && {
              borderBottomColor: theme.button,
            },
          ]}
          onPress={() => setActiveTab('Bank Account Details')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Bank Account Details' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Bank Account Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render tab content */}
      {activeTab === 'UPI Details' ? (
        <UPIDetailsTab
          fetchUserBankDetail={fetchUserBankDetail}
          saveUserBankDetail={updateUserBankDetail}
        />
      ) : (
        <BankAccountDetailsTab
          fetchUserBankDetail={fetchUserBankDetail}
          saveUserBankDetail={updateUserBankDetail}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tab: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
});

export default AccountsAndPaymentsTab;
