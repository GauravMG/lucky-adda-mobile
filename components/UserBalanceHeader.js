import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useBalance } from '../context/BalanceContext';
import { fetchUserCurrentBalance } from '../hooks/userBalance';
import { formatINR } from '../utils/textHelper';

const UserBalanceHeader = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { refreshTrigger } = useBalance();

  const [balance, setBalance] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const getUserBalance = async () => {
        try {
          const userBalance = await fetchUserCurrentBalance();
          setBalance(userBalance);
        } catch (error) {
          console.error('Error fetching user current balance:', error);
        }
      };

      getUserBalance();
    }, [refreshTrigger])
  );

  return (
    <TouchableOpacity
      style={[
        styles.balanceContainer,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={() => navigation.navigate('WalletOptionScreen')}>
      <Text style={[styles.balanceText, { color: theme.text }]}>
        ₹ {formatINR(balance)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserBalanceHeader;
