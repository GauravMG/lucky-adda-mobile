import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useBalance } from "../../context/BalanceContext";
import { fetchWalletList, convertAmount } from '../../services/walletService';
import { formatToTwoDigits, formatINR } from '../../utils/textHelper';
import { getItem } from '../../utils/storage';

const WalletOptionScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();
  const { triggerBalanceRefresh } = useBalance();

  const initialStats = {
    totalbalance: 0,
    totalBonus: 0,
    totalDeposit: 0,
    totalWinning: 0,
    totalWinningConverted: 0,
    totalWinningBalance: 0,
  };

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(initialStats);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [amountToConvert, setAmountToConvert] = useState(0);

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

  useEffect(() => {
    if (isNaN(amountToConvert) || parseFloat(amountToConvert) < 0) {
      setModalVisible(false);
      showNotification(
        'error',
        'Invalid Amount!',
        `Please enter a valid amount.`
      );
      setTimeout(() => setModalVisible(true), 1500);
      return;
    }

    if (Number(stats.totalWinningBalance) < Number(amountToConvert)) {
      setModalVisible(false);
      showNotification(
        'error',
        'Invalid Amount!',
        `Amount should not be more than winning balance.`
      );
      setTimeout(() => setModalVisible(true), 1500);
    }
  }, [amountToConvert, stats]);

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
        setStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAmount = async () => {
    setIsSubmitting(true);
    if (
      !amountToConvert ||
      isNaN(amountToConvert) ||
      parseFloat(amountToConvert) <= 0
    ) {
      setModalVisible(false);
      showNotification(
        'error',
        'Invalid Amount!',
        `Please enter a valid amount.`
      );
      setTimeout(() => setModalVisible(true), 1500);
      setIsSubmitting(false);
      return;
    }

    if (Number(stats.totalWinningBalance) < Number(amountToConvert)) {
      setModalVisible(false);
      showNotification(
        'error',
        'Invalid Amount!',
        `Amount should not be more than winning balance.`
      );
      setTimeout(() => setModalVisible(true), 1500);
      setIsSubmitting(false);
      return;
    }

    try {
      const { success, message } = await convertAmount({
        amount: Number(amountToConvert),
      });

      setModalVisible(false);
      showNotification(
        success ? 'success' : 'error',
        success ? 'Deposit Successful!' : 'Cannot Deposit Amount!',
        message
      );
      setTimeout(() => setModalVisible(true), 1500);

      if (success) {
        setTimeout(() => {
          closeDetailsModal();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setIsSubmitting(false);
    }
  };

  const handleAddMoney = () => {
    navigation.navigate('AddMoneyScreen');
  };

  const handleWithdrawMoney = () => {
    if (Number(stats.totalWinningBalance) <= 0) {
      showNotification(
        'error',
        'Cannot Withdraw Amount!',
        `No winning balance available to withdraw.`
      );
      return
    }

    navigation.navigate('WithdrawMoneyScreen');
  };

  const openDetailsModal = () => {
    if (Number(stats.totalWinningBalance) <= 0) {
      showNotification(
        'error',
        'Cannot Convert Amount!',
        `No winning balance available to convert.`
      );
      return
    }

    setModalVisible(true);
  };

  const closeDetailsModal = () => {
    setAmountToConvert(0);
    setIsSubmitting(false);
    setModalVisible(false);
    loadData();
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
      <View
        style={[
          styles.card,
          styles.statOnlyCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <Text style={[styles.text, { color: theme.text }]}>Total Balance</Text>
        <Text style={[styles.text, styles.amountText, { color: theme.text }]}>
          ₹ {formatINR(formatToTwoDigits(stats.totalbalance))}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          styles.statOnlyCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <Text style={[styles.text, { color: theme.text }]}>Total Bonus</Text>
        <Text style={[styles.text, styles.amountText, { color: theme.text }]}>
          ₹ {formatINR(formatToTwoDigits(stats.totalBonus))}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          styles.statWithActionCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View>
          <Text style={[styles.text, { color: theme.text }]}>Deposit</Text>
          <Text style={[styles.text, styles.amountText, { color: theme.text }]}>
            ₹ {formatINR(formatToTwoDigits(stats.totalDeposit))}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'green' }]}
          onPress={handleAddMoney}>
          <Text style={[styles.text, { color: '#fff' }]}>Add Cash</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.card,
          styles.statWithActionCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View>
          <Text style={[styles.text, { color: theme.text }]}>Winning</Text>
          <Text style={[styles.text, styles.amountText, { color: theme.text }]}>
            ₹ {formatINR(formatToTwoDigits(stats.totalWinningBalance))}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'red' }]}
          onPress={handleWithdrawMoney}>
          <Text style={[styles.text, { color: '#fff' }]}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.card,
          styles.statWithActionCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <View>
          <Text style={[styles.text, { color: theme.text }]}>Winning</Text>
          <Text style={[styles.text, styles.amountText, { color: theme.text }]}>
            ₹ {formatINR(formatToTwoDigits(stats.totalWinningBalance))}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'blue' }]}
          onPress={() => openDetailsModal()}>
          <Text style={[styles.text, { color: '#fff' }]}>Convert</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalHeading, { color: theme.text }]}>
                Convert to Deposit
              </Text>
            </View>

            <View
              style={[
                styles.modalNote,
                { backgroundColor: theme.cardHighlight },
              ]}>
              <Text style={[styles.text, { color: theme.textHighlight }]}>
                यदि आप अपने जीते हुए पैसे को Deposit Balance में बदलते हैं, तो
                आपको अभी 2% कैशबैक मिलेगा।
              </Text>
              <Text style={[styles.text, { color: theme.textHighlight }]}>
                Convert your winnings into Deposits for 2% Cashback
              </Text>
            </View>

            <View style={styles.modalAmountContainer}>
              <Text
                style={[styles.text, { color: theme.text, marginBottom: 10 }]}>
                Enter amount to convert
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter Amount"
                placeholderTextColor={theme.text}
                keyboardType="number-pad"
                value={amountToConvert}
                onChangeText={setAmountToConvert}
              />
            </View>

            <View style={styles.modalActionButtonContainer}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.button }]}
                onPress={() => (isSubmitting ? {} : handleConvertAmount())}>
                <Text
                  style={[styles.closeButtonText, { color: theme.buttonText }]}>
                  Convert
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.button }]}
                onPress={() => (isSubmitting ? {} : closeDetailsModal())}>
                <Text
                  style={[styles.closeButtonText, { color: theme.buttonText }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
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
  loader: {
    marginTop: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 7,
  },
  statOnlyCard: {
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statWithActionCard: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 20,
  },
  actionButton: {
    backgroundColor: 'green',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
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
  },
  modalNote: {
    padding: 10,
    borderRadius: 7,
  },
  modalAmountContainer: {
    marginTop: 10,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalActionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
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

export default WalletOptionScreen;
