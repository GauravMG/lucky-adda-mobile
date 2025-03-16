import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

import { useTheme } from '../../context/ThemeContext';
import { useBalance } from "../../context/BalanceContext";
import { fetchWalletList } from '../../services/walletService';
import { formatDateTime12HourWithoutnewlineShortMonth } from '../../utils/timeHelper';
import { formatToTwoDigits, formatINR } from '../../utils/textHelper';
import { getItem } from '../../utils/storage';

const WalletScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { triggerBalanceRefresh } = useBalance();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkUserData = async () => {
        try {
          const userData = await getItem('userData');
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching JWT Token:', error);
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
    try {
      setLoading(true);
      const { success, message, metadata, stats, data } = await fetchWalletList(
        {
          filter: {
            userId: userData.userId,
          },
          range: {
            all: true,
          },
          sort: [
            {
              orderBy: 'walletId',
              orderDir: 'desc',
            },
          ],
        }
      );

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

  const handleAddMoney = () => {
    navigation.navigate('Add Money');
  };

  const handleWithdrawMoney = () => {
    navigation.navigate('Wallet Options');
  };

  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshScreen} />
      }>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.addMoneyButton, { backgroundColor: theme.button }]}
          onPress={handleAddMoney}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Add Money
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.withdrawButton, { backgroundColor: theme.button }]}
          onPress={handleWithdrawMoney}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Withdraw Money
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        Transaction History
      </Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.walletId.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openDetailsModal(item)}>
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
              <View
                style={[
                  styles.livePlayersContainer,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <Ionicons
                  name="wallet"
                  size={14}
                  style={{ color: theme.text, flex: 0.5 }}
                />
                <Text style={[styles.livePlayers, { color: theme.text }]}>
                  ₹ {formatINR(formatToTwoDigits(item.remainingBalance))}
                </Text>
              </View>
              {item.transactionType === 'credit' ? (
                <View style={{ position: 'relative' }}>
                  <Ionicons
                    name="add-outline"
                    size={25}
                    style={{
                      color: 'green',
                      position: 'absolute',
                      left: 1,
                      top: 1,
                    }}
                  />
                  <Ionicons
                    name="add-outline"
                    size={25}
                    style={{ color: 'green' }}
                  />
                </View>
              ) : (
                <View style={{ position: 'relative' }}>
                  <Ionicons
                    name="remove-outline"
                    size={25}
                    style={{
                      color: 'red',
                      position: 'absolute',
                      left: 1,
                      top: 1,
                    }}
                  />
                  <Ionicons
                    name="remove-outline"
                    size={25}
                    style={{ color: 'red' }}
                  />
                </View>
              )}
              <View
                style={{
                  flex: 3,
                  marginLeft: 10,
                }}>
                <Text style={[styles.text, { color: theme.text }]}>
                  {item.remarks}
                  {item.approvalStatus === 'approved'
                    ? item.approvalRemarks ?? ''
                    : item.approvalStatus === 'rejected'
                    ? ` (Rejected)`
                    : ' (Pending approval)'}
                </Text>
                <Text style={[styles.text, { color: theme.text }]}>
                  {dayjs(item.createdAt).format('DD MMM, YYYY hh:mm A')}
                </Text>
              </View>
              <Text
                style={[
                  styles.text,
                  {
                    color: item.transactionType === 'credit' ? 'green' : 'red',
                    flex: 1,
                  },
                ]}>
                ₹ {formatINR(item.amount)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Ionicons name="wallet" size={16} style={{ color: theme.text }} />
              <Text style={[styles.modalHeading, { color: theme.text }]}>
                {'  '}Statement Details
              </Text>
            </View>

            <View
              style={[
                styles.modalStatementCard,
                { backgroundColor: theme.background },
              ]}>
              {selectedItem?.transactionType === 'credit' ? (
                selectedItem?.resultId ? (
                  <>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: theme.text,
                          borderBottomWidth: 1,
                          paddingBottom: 5,
                          borderBottomColor: theme.border,
                        },
                      ]}>
                      Bet Details
                    </Text>

                    <View style={styles.modalStatementDetails}>
                      <Text style={[styles.text, { color: theme.text }]}>
                        Game Name :{' '}
                        {selectedItem?.game?.name
                          ? selectedItem.game.name
                          : '-'}
                      </Text>
                      <Text style={[styles.text, { color: theme.text }]}>
                        Total Winnings : ₹{' '}
                        {formatINR(selectedItem?.amount ?? 0)}
                      </Text>
                      <Text style={[styles.text, { color: theme.text }]}>
                        Play Date-time :{' '}
                        {selectedItem?.userBets[0]?.createdAt
                          ? formatDateTime12HourWithoutnewlineShortMonth(
                              selectedItem?.userBets[0].createdAt
                            )
                          : '-'}
                      </Text>
                    </View>

                    {selectedItem?.userBets?.length ? (
                      <FlatList
                        data={selectedItem.userBets.filter(
                          (userBet) => userBet.betStatus === 'won'
                        )}
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
                            <Text
                              style={[styles.betText, { color: theme.text }]}>
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
                                        ? theme.danger
                                        : theme.cardHighlight,
                                    color: ['won', 'lost'].includes(
                                      item.betStatus
                                    )
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
                      ''
                    )}
                  </>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: theme.text,
                          borderBottomWidth: 1,
                          paddingBottom: 5,
                          borderBottomColor: theme.border,
                        },
                      ]}>
                      Added Money Successfully
                    </Text>

                    <View style={styles.modalStatementDetails}>
                      <Text style={[styles.text, { color: theme.text }]}>
                        Amount : ₹ {formatINR(selectedItem?.amount ?? 0)}
                      </Text>
                      <Text style={[styles.text, { color: theme.text }]}>
                        Time :{' '}
                        {formatDateTime12HourWithoutnewlineShortMonth(
                          selectedItem?.createdAt
                        )}
                      </Text>
                      <Text style={[styles.text, { color: theme.text }]}>
                        Remarks : {selectedItem?.remarks}
                        {selectedItem?.approvalStatus === 'approved'
                          ? selectedItem?.approvalRemarks ?? ''
                          : selectedItem?.approvalStatus === 'rejected'
                          ? ` (Rejected)`
                          : ' (Pending approval)'}
                      </Text>
                    </View>
                  </>
                )
              ) : selectedItem?.gameId ? (
                <>
                  <Text
                    style={[
                      styles.title,
                      {
                        color: theme.text,
                        borderBottomWidth: 1,
                        paddingBottom: 5,
                        borderBottomColor: theme.border,
                      },
                    ]}>
                    Bet Placed Successfully
                  </Text>

                  <View style={styles.modalStatementDetails}>
                    <Text style={[styles.text, { color: theme.text }]}>
                      Game Name :{' '}
                      {selectedItem?.game?.name
                        ? `${selectedItem.game.name} `
                        : ''}
                    </Text>
                    <Text style={[styles.text, { color: theme.text }]}>
                      Total Bidding : ₹ {formatINR(selectedItem?.amount ?? 0)}
                    </Text>
                    <Text style={[styles.text, { color: theme.text }]}>
                      Play Date-time :{' '}
                      {selectedItem?.userBets[0]?.createdAt
                        ? formatDateTime12HourWithoutnewlineShortMonth(
                            selectedItem?.userBets[0].createdAt
                          )
                        : '-'}
                    </Text>
                  </View>

                  {selectedItem?.userBets?.length ? (
                    <FlatList
                      data={selectedItem.userBets}
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
                                      ? theme.danger
                                      : theme.cardHighlight,
                                  color: ['won', 'lost'].includes(
                                    item.betStatus
                                  )
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
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.title,
                      {
                        color: theme.text,
                        borderBottomWidth: 1,
                        paddingBottom: 5,
                        borderBottomColor: theme.border,
                      },
                    ]}>
                    Withdrawn Money{' '}
                    {selectedItem?.approvalStatus === 'pending'
                      ? 'Approval Pending'
                      : selectedItem?.approvalStatus === 'approved'
                      ? 'Successfully'
                      : selectedItem?.approvalStatus === 'rejected'
                      ? 'Rejected'
                      : ''}
                  </Text>

                  <View style={styles.modalStatementDetails}>
                    <Text style={[styles.text, { color: theme.text }]}>
                      Amount : ₹ {formatINR(selectedItem?.amount ?? 0)}
                    </Text>
                    <Text style={[styles.text, { color: theme.text }]}>
                      Time :{' '}
                      {formatDateTime12HourWithoutnewlineShortMonth(
                        selectedItem?.createdAt
                      )}
                    </Text>
                    <Text style={[styles.text, { color: theme.text }]}>
                      Remarks :{' '}
                      {selectedItem?.approvalStatus === 'pending'
                        ? 'Approval Pending'
                        : selectedItem?.approvalStatus === 'approved'
                        ? selectedItem?.remarks
                        : selectedItem?.approvalStatus === 'rejected'
                        ? selectedItem?.approvalRemarks
                        : ''}
                    </Text>
                  </View>
                </>
              )}
            </View>

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
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  addMoneyButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  withdrawButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  bidItem: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 15,
    marginTop: 2,
    fontWeight: 'bold',
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
  modalStatementCard: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 7,
  },
  modalStatementDetails: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginBottom: 10,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    // marginBottom: 20,
    // textAlign: 'center',
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
  livePlayersContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livePlayers: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default WalletScreen;
