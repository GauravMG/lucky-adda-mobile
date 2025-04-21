import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useBalance } from "../context/BalanceContext";
import ResultList from '../components/ResultList';
import { fetchResultList } from '../services/gameService';

const AllResultsScreen = ({ route }) => {
  const { isLive } = route.params || {};

  const { theme } = useTheme();
  const { triggerBalanceRefresh } = useBalance();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (refreshing) {
      loadData();
    }
  }, [refreshing]);

  const refreshScreen = () => {
    setRefreshing(true);
    triggerBalanceRefresh();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useFocusEffect(
    useCallback(() => {
      refreshScreen();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const { success, message, metadata, data } = await fetchResultList({
        filter: {
          resultStatus: [isLive ? 'live' : 'past'],
        },
        range: {
          all: true,
        },
        sort: [
          {
            orderBy: 'resultTime',
            orderDir: 'asc',
          },
        ],
      });

      if (success) {
        setData(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.section, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
      }>
      <ResultList results={data} isLive={isLive} />

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
});

export default AllResultsScreen;
