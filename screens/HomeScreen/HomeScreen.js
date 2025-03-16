import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

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
import { navigate } from '../../utils/navigation';
import { removeItem } from '../../utils/storage';

const Home = ({ ...props }) => {
  const { theme } = useTheme();
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
      };

      verifyMaintenance();
    }, [])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
      }>
      <BalanceSection refreshScreen={refreshScreen} />

      <View style={styles.row}>
        <WithdrawMoneyButton />
      </View>

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
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
});

export default Home;
