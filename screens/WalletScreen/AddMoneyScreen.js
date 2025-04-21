import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
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
import * as PayFromUPIServices from "../../services/payFromUPIService"
import { getItem } from '../../utils/storage';
import { addQuerySymbol } from "../../utils/urlHelper"

const AddMoneyScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [txnId, setTxnId] = useState('')
  const [paymentLink, setPaymentLink] = useState('')

  const pollingCancelledRef = useRef(false);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const { url } = event;

      if (url.includes('luckyadda://payment-callback')) {
        pollingCancelledRef.current = false;
      }
    };

    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      linkingSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const userData = await getItem('userData');
        setUserData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    checkUserData();
  }, []);

  const handleAddCoins = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
      showNotification('error', 'Invalid Amount!', 'Please enter an amount more than ₹200.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, data } = await createPaymentTransaction({ amount });

      if (success) {
        setTxnId(data.txnId);
        setPaymentTransactionId(data.paymentTransactionId);
        setPaymentModalVisible(true);

        const paymentURL = `${addQuerySymbol(data.paymentLink)}redirect_url=luckyadda://payment-callback`;
        setPaymentLink(paymentURL);

        // Start polling after opening modal
        pollingCancelledRef.current = false;
        pollPaymentStatus(data.txnId, data.paymentTransactionId);

        // Open payment in external browser
        Linking.openURL(paymentURL);
      } else {
        showNotification('error', 'Error!', 'Could not initiate payment.');
      }
    } catch (error) {
      showNotification('error', 'Transaction Failed!', error.message ?? 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollPaymentStatus = async (txnId, paymentTransactionId) => {
    const maxRetries = 37;
    // const maxRetries = 7;
    const interval = 5000;
    let retries = 0;

    const checkStatus = async () => {
      if (pollingCancelledRef.current) return;

      if ((txnId ?? "").toString().trim() !== "") {
        retries++;
        try {
          const response = await PayFromUPIServices.checkPaymentStatus({ txn_id: txnId });

          if (pollingCancelledRef.current) return;

          let transactionStatus = "pending"
          let additionalResponse = {}
          if (!response.success) {
            transactionStatus = "rejected"
          } else {
            if (response.data?.transaction?.status === "ongoing" && retries < maxRetries) {
              transactionStatus = "pending"
            } else if (response.data?.transaction?.status === "ongoing" && retries >= maxRetries) {
              transactionStatus = "rejected"
              additionalResponse = {
                message: "Payment link expired as time exceeded."
              }
            } else if (response.data?.transaction?.status === "completed") {
              transactionStatus = "approved"
            } else {
              transactionStatus = "rejected"
            }
          }

          if (transactionStatus === "pending") {
            setTimeout(checkStatus, interval);
          } else {
            await updatePaymentTransaction({
              paymentTransactionId: parseInt(paymentTransactionId),
              paymentStatus: transactionStatus,
              responseJSON: {
                response,
                ...additionalResponse
              }
            });

            setPaymentLink("");
            setTxnId("");
            setPaymentTransactionId("");
            setPaymentModalVisible(false);

            if (transactionStatus === "approved") {
              showNotification('success', 'Payment Successful!', 'Amount added to wallet.');
              await addCoinsToWallet();
            } else {
              showNotification('error', 'Payment Failed!', 'Transaction was unsuccessful.');
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          if (!pollingCancelledRef.current && retries < maxRetries) {
            setTimeout(checkStatus, interval);
          } else {
            setPaymentLink("");
            setTxnId("");
            setPaymentTransactionId("");
            setPaymentModalVisible(false);
            showNotification('error', 'Status Check Failed!', 'Please try again.');
          }
        }
      }
    };

    checkStatus();
  };

  const addCoinsToWallet = async () => {
    const walletResponse = await addWalletTransaction({
      userId: userData.userId,
      transactionType: 'credit',
      amount,
    });

    if (walletResponse.success) {
      showNotification('success', 'Deposit Successful!', 'Amount added to wallet.');
      setTimeout(() => navigation.goBack(), 2000);
    }
  };

  const handleAddDefinedAmount = (definedAmount) => {
    setAmount(definedAmount.toString());
  };

  const onClickCancelPayment = async () => {
    pollingCancelledRef.current = true;

    try {
      const transactionStatus = "rejected"

      await updatePaymentTransaction({
        paymentTransactionId: parseInt(paymentTransactionId),
        paymentStatus: transactionStatus,
        responseJSON: {
          message: "Transaction cancelled by user."
        }
      });

      setPaymentLink("");
      setTxnId("");
      setPaymentTransactionId("");
      setPaymentModalVisible(false);
    } catch (error) {
      console.error("Cancel error", error);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
        style={[styles.container, { backgroundColor: theme.background }]}>

        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/306/306384.png' }}
          style={styles.cardImage} resizeMode="contain" />
        <Text style={[styles.title, { color: theme.text }]}>Add Money to Wallet</Text>
        <Text style={[styles.note, { color: theme.text }]}>
          (Note : Minimum add amount ₹ 200)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Enter Amount"
          placeholderTextColor={theme.text}
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />
        <View style={styles.definedAmountsParentContainer}>
          {[500, 2000, 5000, 10000].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.definedAmountButton, { backgroundColor: theme.button }]}
              onPress={() => handleAddDefinedAmount(val)}>
              <Text style={[styles.definedAmountButtonText, { color: theme.buttonText }]}>
                ₹ {val.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={handleAddCoins}
          disabled={isSubmitting}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            {isSubmitting ? 'Processing...' : 'Add Amount'}
          </Text>
        </TouchableOpacity>
      
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
      </ScrollView>

      <Modal transparent visible={paymentModalVisible} animationType="slide">
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <ActivityIndicator size="large" color={theme.text} style={styles.loader} />
            <Text style={[styles.popupText, { color: theme.text }]}>Waiting for payment process to complete...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  cardImage: { width: '100%', height: 180, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  note: { textAlign: 'center', marginBottom: 10 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 20 },
  definedAmountsParentContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  definedAmountButton: { padding: 10, margin: 5, borderRadius: 8, width: '45%', alignItems: 'center' },
  definedAmountButtonText: { fontSize: 16, fontWeight: '600' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  infoPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
  },
  infoPopupContainer: {
    backgroundColor: 'rgba(0,0,0,1)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFD700',
    padding: 20,
    alignItems: 'center',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  popupContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 1000,
  },
  popupText: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
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

export default AddMoneyScreen;
