import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useBalance } from "../context/BalanceContext";
import { fetchUserBetList } from '../services/gameService';
import {
  formatDateOnly,
  formatDateTime12HourWithoutnewlineShortMonth,
} from '../utils/timeHelper';
import { formatINR } from '../utils/textHelper';
import { getItem } from '../utils/storage';

function calculateFinalBetStatusAndWinningAmount(gameObject) {
  const { bets } = gameObject;

  let betStatus = '';
  let winningAmount = 0;
  let hasWon = false;
  let allLost = true;

  for (const bet of bets) {
    if (bet.betStatus === 'won') {
      hasWon = true;
      winningAmount += Number(bet.winningAmount);
    }
    if (bet.betStatus !== 'lost') {
      allLost = false;
    }
  }

  if (hasWon) {
    betStatus = 'won';
  } else if (allLost) {
    betStatus = 'lost';
  }

  return {
    betStatus,
    winningAmount,
  };
}

const BidHistoryScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();
  const { triggerBalanceRefresh } = useBalance();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        try {
          const userData = await getItem('userData');
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      checkUserData();
    }, [navigation])
  );

  useEffect(() => {
    if (userData && refreshing) {
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

  useEffect(() => {
    if (userData) {
      loadData();
    }
  }, [userData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { success, data } = await fetchUserBetList({
        filter: { userId: userData.userId },
        range: { all: true },
        sort: [{ orderBy: 'createdAt', orderDir: 'desc' }],
      });

      if (success) {
        const newData = data?.map((el) => ({
          ...el,
          ...calculateFinalBetStatusAndWinningAmount(el),
        }));
        setBidHistory(newData);
        setFilteredBids(newData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (newDate) => {
    setShowStartPicker(false);
    if (endDate && newDate > endDate) {
      showNotification(
        'error',
        'Invalid Date!',
        `Start date cannot be greater than end date.`
      );
      setStartDate(null);
      return;
    }
    setStartDate(newDate);
  };

  const handleEndDateChange = (newDate) => {
    setShowEndPicker(false);
    if (startDate && newDate < startDate) {
      showNotification(
        'error',
        'Invalid Date!',
        `End date cannot be less than start date.`
      );
      setEndDate(null);
      return;
    }
    setEndDate(newDate);
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      showNotification(
        'error',
        'Invalid Date!',
        `Please select both start date and end date to filter data.`
      );
      return;
    }

    const filtered = bidHistory.filter((bid) => {
      const bidDate = new Date(bid.bets[bid.bets.length - 1].createdAt);
      return (
        formatDateOnly(bidDate) >= formatDateOnly(startDate) &&
        formatDateOnly(bidDate) <= formatDateOnly(endDate)
      );
    });

    setFilteredBids(filtered);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilteredBids(bidHistory);
  };

  const openBetDetailsModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
      }>
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          style={[styles.dateButton, { backgroundColor: theme.card }]}>
          <Text style={{ color: theme.text }}>
            {startDate ? startDate.toDateString() : 'Select Start Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          style={[styles.dateButton, { backgroundColor: theme.card }]}>
          <Text style={{ color: theme.text }}>
            {endDate ? endDate.toDateString() : 'Select End Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) =>
            handleStartDateChange(selectedDate)
          }
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => handleEndDateChange(selectedDate)}
        />
      )}

      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          style={[
            styles.dateButton,
            styles.filterButton,
            { backgroundColor: theme.button },
          ]}
          onPress={handleFilter}>
          <Text style={[styles.filterButtonText, { color: theme.buttonText }]}>
            Filter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dateButton,
            styles.filterButton,
            { backgroundColor: theme.button },
          ]}
          onPress={handleReset}>
          <Text style={[styles.filterButtonText, { color: theme.buttonText }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBids}
          keyExtractor={(item) => item.gameId.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openBetDetailsModal(item)}>
              <View
                style={[
                  styles.bidItem,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                ]}>
                <Image
                  source={{ uri: item.game?.logo }}
                  style={styles.cardImage}
                />
                <View>
                  <Text style={[styles.text, { color: theme.text }]}>
                    {item.game?.name ?? ''}{' '}
                    {item.pairType !== 'others'
                      ? `(${item.pairType.toUpperCase()})`
                      : ''}
                  </Text>
                  <Text style={[styles.text, { color: theme.text }]}>
                    {formatDateTime12HourWithoutnewlineShortMonth(
                      `${item.bets[item.bets.length - 1].createdAt}`
                    )}
                  </Text>
                  <Text style={[styles.text, { color: theme.text }]}>
                    <Text style={styles.bold}>Amount : </Text>₹{' '}
                    {formatINR(
                      item.bets
                        .map((bet) => Number(bet.betAmount))
                        .reduce((acc, curr) => acc + curr, 0)
                    )}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.finalBetStatus,
                    {
                      backgroundColor: ['won', 'lost'].includes(item.betStatus)
                        ? theme.cardHighlight
                        : 'unset',
                      color: theme.textHighlight,
                    },
                  ]}>
                  {['won', 'lost'].includes(item.betStatus)
                    ? item.betStatus.toUpperCase()
                    : '        '}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Image
              source={{ uri: selectedItem?.game?.logo }}
              style={styles.cardImage}
            />
            <Text style={[styles.modalHeading, { color: theme.text }]}>
              {selectedItem?.game?.name ? `${selectedItem.game.name} ` : ''}{' '}
              {selectedItem && selectedItem.pairType !== 'others'
                ? `(${selectedItem.pairType.toUpperCase()})`
                : ''}
            </Text>

            {selectedItem?.bets?.length ? (
              <FlatList
                data={selectedItem.bets}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-around' }}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.betItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Text style={[styles.betText, { color: theme.text }]}>
                      {item.betNumber}{' '}
                      <Text style={styles.bold}>
                        (₹ {formatINR(item.betAmount)})
                      </Text>
                    </Text>
                    {['won', 'lost'].includes(item.betStatus) && (
                      <Text
                        style={[
                          styles.modalFinalBetStatus,
                          {
                            backgroundColor:
                              item.betStatus === 'won'
                                ? theme.success
                                : item.betStatus === 'lost'
                                ? theme.button
                                : theme.cardHighlight,
                            color: ['won', 'lost'].includes(item.betStatus)
                              ? theme.buttonText
                              : theme.textHighlight,
                          },
                        ]}>
                        {item.betStatus === 'pending'
                          ? '-'
                          : item.betStatus.toUpperCase()}
                        {item.betStatus === 'won'
                          ? ` ₹ ${formatINR(item.winningAmount)}`
                          : ''}
                      </Text>
                    )}
                  </View>
                )}
              />
            ) : (
              <Text style={{ color: theme.text }}>No Bets Available</Text>
            )}

            {selectedItem?.bets?.length && (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={[styles.text, { color: theme.text }]}>
                  <Text style={styles.bold}>Total Bet Amount: </Text>₹{' '}
                  {formatINR(
                    selectedItem.bets.reduce((sum, bet) => {
                      return Number(sum) + Number(bet.betAmount);
                    }, 0)
                  )}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 5,
                    alignItems: 'center',
                  }}>
                  <Ionicons name="time-outline" size={18} color={theme.text} />
                  <Text
                    style={[styles.text, { color: theme.text, marginLeft: 5 }]}>
                    {formatDateTime12HourWithoutnewlineShortMonth(
                      selectedItem.bets[0].createdAt
                    )}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.button }]}
              onPress={() => setModalVisible(false)}>
              <Text
                style={[styles.closeButtonText, { color: theme.buttonText }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  filterButton: {
    marginTop: 10,
  },
  filterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  bidItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  cardImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
    borderRadius: 50,
    alignSelf: 'center',
  },
  text: {
    fontSize: 15,
    marginTop: 2,
    fontWeight: 'bold',
  },
  finalBetStatus: {
    padding: 5,
    fontSize: 15,
    fontWeight: 'bold',
    borderRadius: 7,
  },
  loader: {
    marginTop: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    maxHeight: '90%',
    margin: 20,
    padding: 20,
    borderRadius: 7,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  betItem: {
    marginVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 120,
  },
  betText: {
    fontSize: 15,
    width: '100%',
    padding: 5,
    paddingVertical: 10,
    borderRadius: 7,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalFinalBetStatus: {
    fontSize: 13,
    width: '100%',
    padding: 5,
    paddingVertical: 10,
    textAlign: 'center',
    borderBottomRightRadius: 7,
    borderBottomLeftRadius: 7,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    borderRadius: 5,
    width: 80,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  closeButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BidHistoryScreen;
