import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../context/ThemeContext';
import { fetchUserCurrentBalance } from '../hooks/userBalance';
import { getItem } from '../utils/storage';
import { formatINR } from '../utils/textHelper';

const BalanceSection = ({}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const userData = await getItem('userData');
        setUserData(userData);
      };

      fetchUserData();
      loadBalance();
    }, [navigation])
  );

  const loadBalance = async () => {
    try {
      const balance = await fetchUserCurrentBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <View
      style={[
        styles.balanceContainer,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        },
      ]}>
      <View>
        <Text style={[styles.name, { color: theme.text }]}>
          {userData?.fullName}
        </Text>
        <Text style={[styles.balanceText, { color: theme.text }]}>
          ₹ {formatINR(balance)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AddMoneyScreen', {
            title: 'Add Money',
          })
        }
        activeOpacity={0.7}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons
            name="add"
            size={24}
            color={theme.buttonText}
            style={[
              styles.addBalanceButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.button,
              },
            ]}
          />
          <Text style={[styles.addBalanceText, { color: theme.text }]}>
            Add Money
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 7,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addBalanceButton: {
    borderWidth: 1,
    borderRadius: 50,
    padding: 5,
  },
  addBalanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default BalanceSection;
