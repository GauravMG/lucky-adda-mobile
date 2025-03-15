import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../../context/ThemeContext';
import ResultList from '../../../components/ResultList';
import { fetchResultList } from '../../../services/gameService';

const ResultSection = ({ title, isLive, refreshing }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (refreshing) {
      loadData();
    }
  }, [refreshing]);

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
    <View style={styles.section}>
      {/* Title and View All */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AllResultsScreen', {
              title,
              isLive,
            })
          }>
          <Text style={[styles.viewAll, { color: theme.text }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <ResultList results={(data ?? []).slice(0, 4)} isLive={isLive} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ResultSection;
