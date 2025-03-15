import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../../context/ThemeContext';
import { formatINR } from '../../../utils/textHelper';

const CrossTab = ({ updateTotalBet, selectedBets, setSelectedBets }) => {
  const { theme } = useTheme();

  const [number, setNumber] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCross = useCallback(() => {
    setLoading(true);

    requestAnimationFrame(() => {
      if (!number || number.length < 2 || isNaN(betAmount) || betAmount <= 0) {
        updateTotalBet(0);
        setSelectedBets([]);
        setLoading(false);
        return;
      }

      // Use a Set to store unique pairs
      const uniquePairs = new Set();

      // Optimized single-pass pair generation
      const pairs = number
        .split('')
        .flatMap((digit1, i) =>
          number.split('').map((digit2, j) => {
            const pair = digit1 + digit2;
            if (!uniquePairs.has(pair)) {
              uniquePairs.add(pair);
              return { pair, amount: betAmount, pairType: 'crossing' };
            }
            return null; // Prevent duplicates
          })
        )
        .filter(Boolean); // Remove null values

      updateTotalBet(pairs.length * Number(betAmount));
      setSelectedBets(pairs);
      setLoading(false);
    });
  }, [number, betAmount, updateTotalBet, setSelectedBets]);

  useEffect(() => {
    if ((number?.length >= 2) & !isNaN(betAmount) && betAmount > 0) {
      generateCross();
    }
  }, [number, betAmount]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setNumber('');
        setBetAmount('');
        updateTotalBet(0);
        setSelectedBets([]);
      };
    }, [])
  );

  const removePair = (index) => {
    const updatedPairs = selectedBets.filter((_, i) => i !== index);
    setSelectedBets(updatedPairs);
    updateTotalBet(updatedPairs.length * Number(betAmount));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: theme.text }]}>Enter Number:</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Eg. 12345"
          keyboardType="number-pad"
          value={number}
          onChangeText={setNumber}
          placeholderTextColor={theme.text}
        />

        <Text style={[styles.label, { color: theme.text }]}>Bet Amount:</Text>
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
          keyboardType="number-pad"
          value={betAmount}
          onChangeText={setBetAmount}
          placeholderTextColor={theme.text}
        />

        <Text style={[styles.resultTitle, { color: theme.text }]}>
          Generated Pairs
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={selectedBets}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.listItem,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <Text style={[styles.pairText, { color: theme.text }]}>
                  {item.pair} = ₹ {formatINR(item.amount)}
                </Text>
                <TouchableOpacity onPress={() => removePair(index)}>
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={theme.danger}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <View style={{ height: 250 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 5,
  },
  pairText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
});

export default CrossTab;
