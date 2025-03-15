import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import ProfileTab from './parts/ProfileTab';
import ChangePasswordTab from './parts/ChangePasswordTab';
import AccountsAndPaymentsTab from './parts/AccountsAndPaymentsTab/AccountsAndPaymentsTab';

const ProfileScreen = () => {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState('Profile');

  const getCurrentScreen = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileTab />;
      case 'Change Password':
        return <ChangePasswordTab />;
      case 'Accounts & Payments':
        return <AccountsAndPaymentsTab />;
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
            activeTab === 'Profile' && styles.activeTab,
            activeTab === 'Profile' && { borderBottomColor: theme.button },
          ]}
          onPress={() => setActiveTab('Profile')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Profile' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Change Password' && styles.activeTab,
            activeTab === 'Change Password' && {
              borderBottomColor: theme.button,
            },
          ]}
          onPress={() => setActiveTab('Change Password')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Change Password' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Change Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Accounts & Payments' && styles.activeTab,
            activeTab === 'Accounts & Payments' && {
              borderBottomColor: theme.button,
            },
          ]}
          onPress={() => setActiveTab('Accounts & Payments')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Accounts & Payments' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Accounts & Payments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render tab content */}
      {getCurrentScreen()}
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
    marginBottom: 10,
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
    fontWeight: 'bold',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
