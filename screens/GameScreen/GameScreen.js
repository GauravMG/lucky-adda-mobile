import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import JantriTab from './parts/JantriTab';
import CrossTab from './parts/CrossTab';
import OpenPlayTab from './parts/OpenPlayTab';
import BetFooter from './parts/BetFooter';

const GameScreen = ({ route }) => {
  const { game } = route.params;

  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState('Jantri');
  const [totalBet, setTotalBet] = useState(0);
  const [selectedBets, setSelectedBets] = useState([]);

  const activeTabComponent = () => {
    switch (activeTab) {
      case 'Jantri':
        return (
          <JantriTab
            updateTotalBet={setTotalBet}
            selectedBets={selectedBets}
            setSelectedBets={setSelectedBets}
          />
        );

      case 'Open Play':
        return (
          <OpenPlayTab
            updateTotalBet={setTotalBet}
            selectedBets={selectedBets}
            setSelectedBets={setSelectedBets}
          />
        );

      case 'Cross':
        return (
          <CrossTab
            updateTotalBet={setTotalBet}
            selectedBets={selectedBets}
            setSelectedBets={setSelectedBets}
          />
        );
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
            activeTab === 'Jantri' && styles.activeTab,
            activeTab === 'Jantri' && { borderBottomColor: theme.button },
          ]}
          onPress={() => setActiveTab('Jantri')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Jantri' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Jantri
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Open Play' && styles.activeTab,
            activeTab === 'Open Play' && { borderBottomColor: theme.button },
          ]}
          onPress={() => setActiveTab('Open Play')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Open Play' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Open Play
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.card },
            activeTab === 'Cross' && styles.activeTab,
            activeTab === 'Cross' && { borderBottomColor: theme.button },
          ]}
          onPress={() => setActiveTab('Cross')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Cross' && styles.activeTabText,
              { color: theme.text },
            ]}>
            Cross
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render tab content */}
      {activeTabComponent()}

      {/* Footer for Betting */}
      <BetFooter game={game} totalBet={totalBet} selectedBets={selectedBets} />
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
    fontWeight: 'bold',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
});

export default GameScreen;
