import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../../context/ThemeContext';
import { fetchTopWinners } from '../../../services/walletService';
import { formatINR } from '../../../utils/textHelper';

const TopWinnersScreen = () => {
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      refreshScreen();
    }, [])
  );

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

  const loadData = async () => {
    setLoading(true);
    try {
      const { success, data } = await fetchTopWinners({
        range: { page: 1, pageSize: 10 },
      });

      if (success) {
        setData(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const trophyImages = [
      require('../../../assets/trophy-first.jpg'), // 1st place
      require('../../../assets/trophy-second.jpg'), // 2nd place
      require('../../../assets/trophy-third.jpg'), // 3rd place
    ];

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View style={styles.trophyContainer}>
          <Image
            source={
              trophyImages[index] ??
              require('../../../assets/trophy-normal.jpg')
            }
            style={[styles.trophyImage, { borderColor: theme.border }]}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.playerName, { color: theme.text }]}>
            {item.user?.fullName ?? 'Player'}
          </Text>
          <View
            style={[
              styles.amountContainer,
              { backgroundColor: theme.toggleBackground },
            ]}>
            <Text style={[styles.currency, { color: theme.text }]}>₹</Text>
            <Text style={[styles.winningAmount, { color: theme.text }]}>
              {formatINR(item.totalWinnings)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
      }>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
        />
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loader: {
    marginTop: 20,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  currency: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  winningAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  trophyContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  trophyImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    padding: 5,
    borderWidth: 1,
  },
});

export default TopWinnersScreen;
