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
  Button,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { createPaymentTransaction, updatePaymentTransaction } from "../../services/paymentService";
import { addWalletTransaction } from '../../services/walletService';
import * as PayFromUPIServices from "../../services/payFromUPIService"
import { getItem } from '../../utils/storage';

const AddMoneyScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [txnId, setTxnId] = useState('');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');

  const pollingCancelledRef = useRef(false);

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
      console.log(`data`, data)

      if (success) {
        setPaymentLink(data.paymentLink);
        setTxnId(data.txnId);
        setPaymentTransactionId(data.paymentTransactionId);
        setPaymentModalVisible(true);

        // Start polling after opening modal
        pollingCancelledRef.current = false;
        pollPaymentStatus(data.txnId, data.paymentTransactionId);
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
          console.log(`response`, response)

          if (pollingCancelledRef.current) return;

          let transactionStatus = "pending"
          let additionalResponse = {}
          if (!response.success) {
            console.log(`here 1`)
            transactionStatus = "rejected"
          } else {
            console.log(`here 2`)
            if (response.data?.transaction?.status === "ongoing" && retries < maxRetries) {
              console.log(`here 3`)
              transactionStatus = "pending"
            } else if (response.data?.transaction?.status === "ongoing" && retries >= maxRetries) {
              console.log(`here 4`)
              transactionStatus = "rejected"
              additionalResponse = {
                message: "Payment link expired as time exceeded."
              }
            } else if (response.data?.transaction?.status === "completed") {
              console.log(`here 5`)
              transactionStatus = "approved"
            } else {
              console.log(`here 6`)
              transactionStatus = "rejected"
            }
          }

          if (transactionStatus === "pending") {
            console.log(`here 7`)
            setTimeout(checkStatus, interval);
          } else {
            console.log(`here 8`)
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
              console.log(`here 9`)
              showNotification('success', 'Payment Successful!', 'Amount added to wallet.');
              await addCoinsToWallet();
            } else {
              console.log(`here 10`)
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
      </ScrollView>

      {/* WebView Modal for UPI Payment Link */}
      <Modal visible={paymentModalVisible} animationType="slide" transparent={false}>
        <View style={{ flex: 1 }}>
          <WebView source={{ uri: paymentLink }} startInLoadingState={true} style={{ flex: 1 }} />
          <TouchableOpacity
            style={{
              backgroundColor: '#ff4444',
              padding: 15,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => onClickCancelPayment()}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  cardImage: { width: '100%', height: 180, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  note: { textAlign: 'center', marginBottom: 10 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 20 },
  definedAmountsParentContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  definedAmountButton: { padding: 10, margin: 5, borderRadius: 8, width: '45%', alignItems: 'center' },
  definedAmountButtonText: { fontSize: 16, fontWeight: '600' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});

export default AddMoneyScreen;
