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
import ResultList from '../components/ResultList';
import { fetchResultList } from '../services/gameService';

const AllResultsScreen = ({ route }) => {
  const { isLive } = route.params || {};

  const { theme } = useTheme();

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
    flex: 1,
    padding: 20,
  },
});

export default AllResultsScreen;
