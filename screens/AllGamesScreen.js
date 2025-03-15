import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import GameList from '../components/GameList';
import { fetchGameList } from '../services/gameService';

const AllGamesScreen = ({ route }) => {
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
      const { success, message, metadata, data } = await fetchGameList({
        filter: {
          gameStatus: [isLive ? 'live' : 'upcoming'],
        },
        range: {
          all: true,
        },
        sort: [
          {
            orderBy: 'startTime',
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
      <GameList games={data} isLive={isLive} refreshScreen={refreshScreen} />

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

export default AllGamesScreen;
