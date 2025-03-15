import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import SettingsTab from './parts/SettingsTab';
import RulesTab from './parts/RulesTab';
import ReferEarnTab from './parts/ReferEarnTab/ReferEarnTab';
import HelpTab from './parts/HelpTab';

const MoreScreen = ({ route }) => {
  const { tab } = route.params || {};
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState(tab ?? 'Settings');

  const getCurrentScreen = () => {
    switch (activeTab) {
      case 'Settings':
        return <SettingsTab />;
      case 'Rules':
        return <RulesTab />;
      case 'Refer & Earn':
        return <ReferEarnTab />;
      case 'Help':
        return <HelpTab />;
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
            activeTab === 'Settings' && styles.activeTab,
            activeTab === 'Settings' && { borderBottomColor: theme.button },
          ]}
          onPress={() => setActiveTab('Settings')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Settings' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Rules' && styles.activeTab,
            activeTab === 'Rules' && {
              borderBottomColor: theme.button,
            },
          ]}
          onPress={() => setActiveTab('Rules')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Rules' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Rules
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Refer & Earn' && styles.activeTab,
            activeTab === 'Refer & Earn' && {
              borderBottomColor: theme.button,
            },
          ]}
          onPress={() => setActiveTab('Refer & Earn')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Refer & Earn' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Refer & Earn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Help' && styles.activeTab,
            activeTab === 'Help' && {
              borderBottomColor: theme.button,
            },
          ]}
          onPress={() => setActiveTab('Help')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Help' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Help
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
  },
  activeTabText: {
    fontWeight: 'bold',
  },
});

export default MoreScreen;
