import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { addWalletTransaction } from '../../services/walletService';
import { getItem } from '../../utils/storage';
import { fetchUserCurrentWinningBalance } from '../../hooks/userWinningBalance';

const WithdrawMoneyScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (isNaN(amount) || parseFloat(amount) < 0) {
      showNotification(
        'error',
        'Invalid Amount!',
        `Please enter a valid amount.`
      );
      return;
    }

    if (Number(amount) > Number(balance)) {
      showNotification(
        'error',
        'Invalid Amount!',
        `Withdraw amount cannot be more than current balance of ₹${balance}.`
      );
    }
  }, [amount, balance]);

  const [userData, setUserData] = useState(null);
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
      const getUserBalance = async () => {
        try {
          const userBalance = await fetchUserCurrentWinningBalance();
          setBalance(userBalance);
        } catch (error) {
          console.error('Error fetching user current balance:', error);
        }
      };

      checkUserData();
      getUserBalance();
    }, [navigation])
  );

  const handleWithdrawCoins = async () => {
    setIsSubmitting(true);
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showNotification(
        'error',
        'Invalid Amount!',
        `Please enter a valid amount.`
      );
      setIsSubmitting(false);
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) < 900) {
      showNotification(
        'error',
        'Invalid Amount!',
        `Please enter an amount more than 900.`
      );
      setIsSubmitting(false);
      return;
    }

    if (Number(amount) > Number(balance)) {
      showNotification(
        'error',
        'Invalid Amount!',
        `Withdraw amount cannot be more than current balance of ₹${balance}.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const { success, data } = await addWalletTransaction({
        userId: userData.userId,
        transactionType: 'debit',
        amount,
      });

      if (success) {
        showNotification(
          'success',
          'Withdraw Requested!',
          `We have received your request to withdraw an amount of ${amount}. You will receive the amount after approval.`
        );
        setTimeout(() => navigation.goBack(), 2000);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={{
          uri: 'https://i.pinimg.com/736x/5f/6f/eb/5f6feb880b0692b6daa5200c292592f1.jpg',
        }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.text }]}>
        Withdraw Money from Wallet
      </Text>
      <Text style={[styles.note, { color: theme.text }]}>
        (Note : Minimum withdrawal amount ₹ 900)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.border,
            backgroundColor: theme.card,
            color: theme.text,
            placeholderTextColor: theme.text,
          },
        ]}
        placeholder="Enter Amount"
        placeholderTextColor={theme.text}
        keyboardType="number-pad"
        value={amount}
        onChangeText={(text) => {
          if (!/^\d*\.?\d*$/.test(text)) return; // Allow only numbers and decimals
          if (text === '') {
            setAmount('');
            return;
          }
      
          const numericValue = parseFloat(text);
          
          if (isNaN(numericValue) || parseFloat(numericValue) <= 0) {
            showNotification(
              'error',
              'Invalid Amount!',
              `Please enter a valid amount.`
            );
            return;
          }
      
          if (Number(numericValue) > Number(balance)) {
            showNotification(
              'error',
              'Invalid Amount!',
              `Withdraw amount cannot be more than current balance of ₹${balance}.`
            );
            return;
          }

          setAmount(text);
        }}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => (isSubmitting ? {} : handleWithdrawCoins())}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Withdraw Amount
        </Text>
      </TouchableOpacity>

      <View
        style={[styles.noteSection, { backgroundColor: theme.cardHighlight }]}>
        <Text style={[styles.noteLabel, { color: theme.accent }]}>
          Withdraw की मंजूरी सिर्फ सुबह 10 बजे से दोपहर 4 बजे तक मिलेगी।
        </Text>
        <Text style={[styles.noteLabel, { color: theme.accent }]}>
          Withdraw request approval only from 10 AM to 4 PM
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  cardImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center',
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
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noteSection: {
    marginVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default WithdrawMoneyScreen;
