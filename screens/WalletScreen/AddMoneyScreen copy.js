import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';

import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { createPaymentTransaction, updatePaymentTransaction } from "../../services/paymentService";
import { addWalletTransaction } from '../../services/walletService';
import { getItem } from '../../utils/storage';

const AddMoneyScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const userData = await getItem('userData');
        setUserData(userData);
      } catch (error) {
        console.error('Error fetching JWT Token:', error);
      }
    };

    checkUserData();
  }, []);

  const handleAddCoins = async () => {
    setIsSubmitting(true);
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showNotification('error', 'Invalid Amount!', `Please enter a valid amount.`);
      setIsSubmitting(false);
      return;
    }
  
    if (!amount || isNaN(amount) || parseFloat(amount) < 200) {
      showNotification('error', 'Invalid Amount!', `Please enter an amount more than 200.`);
      setIsSubmitting(false);
      return;
    }
  
    try {
      // Step 1: Create Payment Transaction
      const { success, data } = await createPaymentTransaction({ amount });
  
      if (success) {
        console.log('Payment transaction data:', data);
  
        // Step 2: Open UPI Intent for user to make payment
        await openUPIIntent(data.paymentLink);
  
        // Step 3: Start polling to check payment status
        await pollPaymentStatus(data.txnId, data.paymentTransactionId);
  
      }
    } catch (error) {
      console.error('Error occurred during payment process:', error);
      setIsSubmitting(false);
      setTimeout(() => navigation.goBack(), 2000);
    }
  };

  const openUPIIntent = async (paymentLink) => {
    try {
      await Linking.openURL(paymentLink);
    } catch (err) {
      showNotification('error', 'Unable to open UPI App!', `Make sure a UPI app is installed.`);
      setTimeout(() => navigation.goBack(), 2000);
    }
  }
  
  // Polling function for payment status
  const pollPaymentStatus = async (txnId, paymentTransactionId) => {
    const maxRetries = 36; // Maximum number of retries
    const interval = 5000; // Interval between checks (5 seconds)
    let retries = 0;
  
    const checkStatus = async () => {
      retries++;
      const paymentStatusResponse = await checkPaymentStatus(txnId);

      await updatePaymentStatus({
        paymentTransactionId: parseInt(paymentTransactionId),
        paymentStatus: paymentStatusResponse.success ? "approved" : "rejected",
        responseJSON: paymentStatusResponse
      })
  
      if (paymentStatusResponse.success) {
        // Handle payment success
        showNotification('success', 'Payment Successful!', `Amount added to wallet.`);
        // Proceed with adding coins to wallet
        await addCoinsToWallet();
      } else if (retries < maxRetries) {
        // If payment is still pending, retry
        setTimeout(checkStatus, interval);
      } else {
        // If max retries reached
        showNotification('error', 'Payment Failed!', `Transaction was unsuccessful. Please try again.`);
        setTimeout(() => navigation.goBack(), 2000);
      }
    };
  
    checkStatus(); // Start the polling process
  };
  
  // Function to check payment status
  const checkPaymentStatus = async (txnId) => {
    try {
      const response = await fetch('https://payfromupi.com/api/check-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txn_id: txnId }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return { success: false };
    }
  };

  const updatePaymentStatus = async (payload) => {
    try {
      await updatePaymentTransaction(payload);
    } catch (error) {
      throw error
    }
  }
  
  // Function to add coins to the wallet
  const addCoinsToWallet = async () => {
    const walletResponse = await addWalletTransaction({
      userId: userData.userId,
      transactionType: 'credit',
      amount,
    });
  
    if (walletResponse.success) {
      // Show success message and navigate back after success
      showNotification('success', 'Deposit Successful!', `Amount added to wallet.`);
      setTimeout(() => navigation.goBack(), 2000);
    }
  };  

  const handleAddDefinedAmount = (definedAmount) => {
    setAmount(definedAmount.toString());
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={{
          uri: 'https://cdn-icons-png.flaticon.com/512/306/306384.png',
        }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.text }]}>
        Add Money to Wallet
      </Text>
      <Text style={[styles.note, { color: theme.text }]}>
        (Note : Minimum add amount ₹ 200)
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
        value={amount}
        onChangeText={setAmount}
      />
      <View style={styles.definedAmountsParentContainer}>
        <TouchableOpacity
          style={[
            styles.definedAmountButton,
            { backgroundColor: theme.button },
          ]}
          onPress={() => handleAddDefinedAmount(500)}>
          <Text
            style={[
              styles.definedAmountButtonText,
              { color: theme.buttonText },
            ]}>
            ₹ 500
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.definedAmountButton,
            { backgroundColor: theme.button },
          ]}
          onPress={() => handleAddDefinedAmount(2000)}>
          <Text
            style={[
              styles.definedAmountButtonText,
              { color: theme.buttonText },
            ]}>
            ₹ 2,000
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.definedAmountButton,
            { backgroundColor: theme.button },
          ]}
          onPress={() => handleAddDefinedAmount(5000)}>
          <Text
            style={[
              styles.definedAmountButtonText,
              { color: theme.buttonText },
            ]}>
            ₹ 5,000
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.definedAmountButton,
            { backgroundColor: theme.button },
          ]}
          onPress={() => handleAddDefinedAmount(10000)}>
          <Text
            style={[
              styles.definedAmountButtonText,
              { color: theme.buttonText },
            ]}>
            ₹ 10,000
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => (isSubmitting ? {} : handleAddCoins())}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Add Amount
        </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleUPIPayment}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Pay via UPI</Text>
      </TouchableOpacity> */}

      <View
        style={[styles.noteSection, { backgroundColor: theme.cardHighlight }]}>
        <Text style={[styles.noteLabel, { color: theme.accent }]}>
          ₹ 2000 से ज्यादा ऐड करें Money{'\n'}
          और 1% एक्स्ट्रा कैशबैक पाएँ!
        </Text>
        <Text style={[styles.noteLabel, { color: theme.textHighlight }]}>
          अभी ऑफर का लाभ उठाएँ!
        </Text>
        <Text style={[styles.noteLabel, { color: theme.success }]}>
          एक्स्ट्रा कैशबैक का आनंद उठाएँ!
        </Text>
        <Text style={[styles.noteLabel, { color: theme.primary }]}>
          Add above ₹ 2000, get 1% extra cashback!
        </Text>
        <Text style={[styles.noteLabel, { color: theme.textHighlight }]}>
          Grab the offer now!
        </Text>
        <Text style={[styles.noteLabel, { color: theme.success }]}>
          Enjoy extra cashback!
        </Text>
        <Text style={[styles.noteLabel, { color: theme.danger }]}>
          UPI Payments Options :
        </Text>
        <Text style={[styles.noteLabel, { color: theme.border }]}>
          Google Pay (GPay), PayTM, PhonePe{'\n'}
          BHIM UPI, Multiple Apps Supported...
        </Text>
      </View>

      <Modal
        visible={isSubmitting}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <ActivityIndicator size="large" color={theme.text} style={styles.loader} />
              <Text style={[styles.modalHeading, { color: theme.text }]}>
                {'  '}Waiting for payment confirmation...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
  definedAmountsParentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  definedAmountButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  definedAmountButtonText: {
    fontSize: 14,
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
  loader: {
    marginVertical: 20,
  },
});

export default AddMoneyScreen;
