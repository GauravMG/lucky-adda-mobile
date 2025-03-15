import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
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

  // useEffect(() => {
  //   const handleUPIResponse = (event) => {
  //     const { url } = event;
  //     if (!url) return;

  //     const params = new URLSearchParams(url.split('?')[1]);
  //     const status = params.get('Status');
  //     const txnRef = params.get('txnRef');
  //     const txnId = params.get('txnId');

  //     if (status === 'SUCCESS') {
  //       Alert.alert('Payment Successful', `Transaction ID: ${txnId}`);
  //     } else if (status === 'FAILURE') {
  //       Alert.alert('Payment Failed', 'Transaction was unsuccessful.');
  //     } else {
  //       Alert.alert('Payment Cancelled', 'User cancelled the transaction.');
  //     }
  //   };

  //   const subscription = Linking.addEventListener('url', handleUPIResponse);

  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);

  const handleAddCoins = async () => {
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

    if (!amount || isNaN(amount) || parseFloat(amount) < 200) {
      showNotification(
        'error',
        'Invalid Amount!',
        `Please enter an amount more than 200.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const { success, data } = await addWalletTransaction({
        userId: userData.userId,
        transactionType: 'credit',
        amount,
      });

      if (success) {
        showNotification(
          'success',
          'Deposit Successful!',
          `Amount added to wallet.`
        );
        // Alert.alert('Deposit Requested', `Amount added to wallet.`);
        setTimeout(() => navigation.goBack(), 2000);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setIsSubmitting(false);
    }
  };

  // const handleUPIPayment = async () => {
  //   if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
  //     Alert.alert('Invalid Amount', 'Please enter a valid amount.');
  //     return;
  //   }

  //   const UPI_ID = '8285348403@upi'; // Replace with your actual UPI ID
  //   const TRANSACTION_ID = `TXN${Date.now()}`; // Unique transaction ID

  //   const upiUri = `upi://pay?pa=${encodeURIComponent(
  //     UPI_ID
  //   )}&pn=${encodeURIComponent('Your Name')}&am=${encodeURIComponent(
  //     amount
  //   )}&cu=INR&tr=${encodeURIComponent(TRANSACTION_ID)}&tn=${encodeURIComponent(
  //     'Wallet Recharge'
  //   )}`;

  //   try {
  //     const supported = await Linking.canOpenURL(upiUri);
  //     if (supported) {
  //       Linking.openURL(upiUri);
  //     } else {
  //       Alert.alert('Error', 'No UPI app found.');
  //     }
  //   } catch (error) {
  //     Alert.alert('Payment Failed', 'Something went wrong.');
  //     console.error('UPI Payment Error:', error);
  //   }
  // };

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
});

export default AddMoneyScreen;
