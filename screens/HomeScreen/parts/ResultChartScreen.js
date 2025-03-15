import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';

import { useTheme } from '../../../context/ThemeContext';
import { fetchResultChartList } from '../../../services/gameService';

// Get current month and year
const currentDate = moment().date();
const currentMonth = moment().month() + 1;
const currentYear = moment().year();

function toTwoDigits(number) {
  return number < 10 ? '0' + number : number.toString();
}

const ResultChartScreen = () => {
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [results, setResults] = useState({});
  const [data, setData] = useState([]);
  const [gameColorMap, setGameColorMap] = useState({});

  const horizontalScrollRef = useRef(null);
  const headerScrollRef = useRef(null);

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

  useEffect(() => {
    generateDates();
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [daysInMonth]);

  useEffect(() => {
    if (data.length && daysInMonth.length) {
      generateResultsFromData();
    }
  }, [data, daysInMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { success, data } = await fetchResultChartList({
        filter: { resultMonth: `${year}-${toTwoDigits(month)}` },
        range: { all: true },
        sort: [{ orderBy: 'name', orderDir: 'asc' }],
      });
      if (success) {
        setData(data);

        // Assign colors to games
        const colorMap = {};
        data.forEach((game, index) => {
          colorMap[game.gameId] =
            theme.gameColors[index % theme.gameColors.length];
        });
        setGameColorMap(colorMap);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDates = () => {
    let daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();

    // If the selected month and year match the current month and year, limit days to today
    if (year === currentYear && month === currentMonth) {
      daysInMonth = currentDate;
    }

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    setDaysInMonth(days);
  };

  const generateResultsFromData = () => {
    const newResults = {};

    data.forEach((game) => {
      daysInMonth.forEach((day) => {
        const dateString = `${year}-${toTwoDigits(month)}-${toTwoDigits(day)}`;

        const resultEntry = game.gameResults.find(
          (r) => moment(r.resultTime).format('YYYY-MM-DD') === dateString
        );

        newResults[`${day}-${game.gameId}`] = resultEntry
          ? resultEntry.resultNumber
          : '-';
      });
    });

    setResults(newResults);
  };

  // Horizontal scroll sync handler
  const handleHorizontalScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollTo({ x: scrollX, animated: false });
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Month & Year Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={month}
          style={[
            styles.picker,
            { color: theme.text, backgroundColor: theme.toggleBackground },
          ]}
          onValueChange={(itemValue) => setMonth(itemValue)}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <Picker.Item
              key={m}
              label={moment()
                .month(m - 1)
                .format('MMMM')}
              value={m}
            />
          ))}
        </Picker>
        <Picker
          selectedValue={year}
          style={[
            styles.picker,
            { color: theme.text, backgroundColor: theme.toggleBackground },
          ]}
          onValueChange={(itemValue) => setYear(itemValue)}>
          {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(
            (y) => (
              <Picker.Item key={y} label={`${y}`} value={y} />
            )
          )}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          nestedScrollEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
          }>
          <View
            style={[styles.tableContainer, { backgroundColor: theme.card }]}>
            {/* Fixed Date Column */}
            <View>
              <View
                style={[
                  styles.headerCell,
                  {
                    backgroundColor: theme.toggleBackground,
                    borderColor: theme.border,
                    width: 50,
                  },
                ]}>
                <Text style={[styles.headerText, { color: theme.text }]}>
                  Day
                </Text>
              </View>
              {daysInMonth.map((day) => (
                <View
                  key={day}
                  style={[styles.dateCell, { borderColor: theme.border }]}>
                  <Text style={[styles.text, { color: theme.text }]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Horizontal Scrollable Columns */}
            <View style={{ flex: 1 }}>
              <ScrollView
                horizontal
                ref={headerScrollRef}
                scrollEnabled={false}>
                <View style={styles.gameHeaderRow}>
                  {data.map((game) => (
                    <View
                      key={game.gameId}
                      style={[
                        styles.headerCell,
                        {
                          backgroundColor: gameColorMap[game.gameId],
                          borderColor: theme.border,
                        },
                      ]}>
                      <Text style={[styles.headerText, { color: theme.text }]}>
                        {game.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <ScrollView
                horizontal
                ref={horizontalScrollRef}
                onScroll={handleHorizontalScroll}
                scrollEventThrottle={16}
                nestedScrollEnabled>
                <View>
                  {daysInMonth.map((day) => (
                    <View key={day} style={styles.gameRow}>
                      {data.map((game) => (
                        <View
                          key={game.gameId}
                          style={[
                            styles.cell,
                            {
                              backgroundColor: gameColorMap[game.gameId],
                              border: theme.border,
                            },
                          ]}>
                          <Text style={[styles.text, { color: theme.text }]}>
                            {results[`${day}-${game.gameId}`]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  picker: { flex: 1 },
  tableContainer: { flexDirection: 'row' },
  dateCell: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    fontWeight: 'bold',
  },
  text: { fontSize: 14, fontWeight: 'bold' },
  gameHeaderRow: { flexDirection: 'row' },
  headerCell: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    fontWeight: 'bold',
  },
  headerText: { fontSize: 12, fontWeight: 'bold' },
  gameRow: { flexDirection: 'row' },
  cell: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    fontWeight: 'bold',
  },
});

export default ResultChartScreen;
