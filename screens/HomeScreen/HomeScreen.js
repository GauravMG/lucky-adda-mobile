import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useBalance } from "../../context/BalanceContext";
import BannerReferAndEarn from './parts/BannerReferAndEarn';
import GameSection from './parts/GameSection';
import ResultSection from './parts/ResultSection';
import BalanceSection from '../../components/BalanceSection';
import TopWinnersButton from '../../components/TopWinnersButton';
import ResultChartButton from '../../components/ResultChartButton';
import HelpButton from '../../components/HelpButton';
import WithdrawMoneyButton from '../../components/WithdrawMoneyButton';
import { checkMaintenance } from '../../hooks/checkMaintenance';
import { removeItem, setItem } from '../../utils/storage';

const Home = ({ ...props }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { triggerBalanceRefresh } = useBalance();

  const [refreshing, setRefreshing] = useState(false);

  const refreshScreen = () => {
    setRefreshing(true);
    triggerBalanceRefresh();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useFocusEffect(
    useCallback(() => {
      const verifyMaintenance = async () => {
        const newAppMaintenanceData = await checkMaintenance();

        if (newAppMaintenanceData.isAppShutdown) {
          await removeItem('jwtToken');
          await removeItem('userData');

          navigate('LoginScreen');
        } else {
          refreshScreen();
        }
        await setItem('appSettingData', newAppMaintenanceData);
      };

      verifyMaintenance();
    }, [])
  );

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
      }>
      <BalanceSection refreshScreen={refreshScreen} />

      <View style={styles.row}>
        <WithdrawMoneyButton />
      </View>

      {/* New Game Button */}
      {/* <TouchableOpacity style={styles.newGameButton} onPress={() => navigation.navigate('PappuPlayingPicturesScreen')}>
        <Text style={styles.newGameText}>🎮 Play a New Game</Text>
      </TouchableOpacity> */}

      <View style={styles.row}>
        <TopWinnersButton />

        <ResultChartButton />

        <HelpButton />
      </View>

      <View style={styles.row}>
        <BannerReferAndEarn />
      </View>

      {/* Live Results Section */}
      <ResultSection
        title="Live Results"
        isLive={true}
        refreshing={refreshing}
      />

      {/* Live Games Section */}
      <GameSection
        {...props}
        title="Live Games"
        isLive={true}
        refreshing={refreshing}
        refreshScreen={refreshScreen}
      />

      {/* Upcoming Games Section */}
      <GameSection
        {...props}
        title="Upcoming Games"
        isLive={false}
        refreshing={refreshing}
        refreshScreen={refreshScreen}
      />

      {/* Last Results Section */}
      <ResultSection
        title="Last Results"
        isLive={false}
        refreshing={refreshing}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  newGameButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  newGameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
