import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useTheme } from '../../../context/ThemeContext';
import { containsAlphabets } from '../../../utils/textHelper';

const JantriTab = ({ updateTotalBet, selectedBets, setSelectedBets }) => {
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedBets([]);
        updateTotalBet(0);
      }; // Reset on blur
    }, [])
  );

  const handleBetChange = (pair, amount) => {
    setSelectedBets((prevBets) => {
      let newBets = [...prevBets];

      // Convert amount to number (default 0 if empty)
      const betAmount = Number(amount) || 0;

      // Find index of the bet
      const existingIndex = newBets.findIndex((bet) => bet.pair === pair);

      if (betAmount > 0) {
        if (existingIndex !== -1) {
          // Update existing bet
          newBets[existingIndex].amount = betAmount;
        } else {
          // Add new bet
          newBets.push({
            pair,
            amount: betAmount,
            pairType: containsAlphabets(pair) ? 'harup' : 'jodi',
          });
        }
      } else {
        // Remove bet if amount is 0
        newBets = newBets.filter((bet) => bet.pair !== pair);
      }

      // Calculate total amount
      const total = newBets.reduce((sum, bet) => sum + bet.amount, 0);
      updateTotalBet(total);

      return newBets;
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Grid 00-99 */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Number (00-99)
          </Text>
          <View style={styles.gridContainer}>
            {Array.from({ length: 100 }, (_, i) =>
              i.toString().padStart(2, '0')
            ).map((item) => {
              const existingBet = selectedBets.find((bet) => bet.pair === item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.gridBox,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    existingBet
                      ? {
                          backgroundColor: theme.primary,
                          color: theme.buttonText,
                        }
                      : {},
                  ]}>
                  <Text
                    style={[
                      styles.gridText,
                      existingBet
                        ? { color: theme.buttonText }
                        : { color: theme.text },
                    ]}>
                    {item}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.currencySymbol,
                        existingBet
                          ? { color: theme.buttonText }
                          : { color: theme.text },
                      ]}>
                      ₹
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        existingBet
                          ? {
                              color: theme.buttonText,
                              borderBottomColor: theme.border,
                            }
                          : {
                              color: theme.text,
                              borderBottomColor: theme.border,
                            },
                      ]}
                      keyboardType="number-pad"
                      placeholderTextColor={theme.text}
                      value={existingBet ? String(existingBet.amount) : ''}
                      onChangeText={(value) => handleBetChange(item, value)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ander (A) */}
          <Text
            style={[
              styles.sectionTitle,
              styles.sectionSpacing,
              { color: theme.text },
            ]}>
            Ander (A)
          </Text>
          <View style={styles.gridContainer}>
            {Array.from({ length: 10 }, (_, i) => i.toString()).map((item) => {
              const pair = `A${item}`;
              const existingBet = selectedBets.find((bet) => bet.pair === pair);
              return (
                <TouchableOpacity
                  key={pair}
                  style={[
                    styles.gridBox,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    existingBet ? { backgroundColor: theme.primary } : {},
                  ]}>
                  <Text
                    style={[
                      styles.gridText,
                      existingBet
                        ? { color: theme.buttonText }
                        : { color: theme.text },
                    ]}>
                    {item}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.currencySymbol,
                        existingBet
                          ? { color: theme.buttonText }
                          : { color: theme.text },
                      ]}>
                      ₹
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        existingBet
                          ? {
                              color: theme.buttonText,
                              borderBottomColor: theme.border,
                            }
                          : {
                              color: theme.text,
                              borderBottomColor: theme.border,
                            },
                      ]}
                      keyboardType="number-pad"
                      placeholderTextColor={theme.text}
                      value={existingBet ? String(existingBet.amount) : ''}
                      onChangeText={(value) => handleBetChange(pair, value)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bahar (B) */}
          <Text
            style={[
              styles.sectionTitle,
              styles.sectionSpacing,
              { color: theme.text },
            ]}>
            Bahar (B)
          </Text>
          <View style={styles.gridContainer}>
            {Array.from({ length: 10 }, (_, i) => i.toString()).map((item) => {
              const pair = `B${item}`;
              const existingBet = selectedBets.find((bet) => bet.pair === pair);
              return (
                <TouchableOpacity
                  key={pair}
                  style={[
                    styles.gridBox,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    existingBet ? { backgroundColor: theme.primary } : {},
                  ]}>
                  <Text
                    style={[
                      styles.gridText,
                      existingBet
                        ? { color: theme.buttonText }
                        : { color: theme.text },
                    ]}>
                    {item}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.currencySymbol,
                        existingBet
                          ? { color: theme.buttonText }
                          : { color: theme.text },
                      ]}>
                      ₹
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        existingBet
                          ? {
                              color: theme.buttonText,
                              borderBottomColor: theme.border,
                            }
                          : {
                              color: theme.text,
                              borderBottomColor: theme.border,
                            },
                      ]}
                      keyboardType="number-pad"
                      placeholderTextColor={theme.text}
                      value={existingBet ? String(existingBet.amount) : ''}
                      onChangeText={(value) => handleBetChange(pair, value)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Extra bottom padding */}
          <View style={{ height: 250 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  sectionSpacing: { marginTop: 20 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gridBox: {
    padding: 6,
    margin: 5,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    width: 50,
    height: 55,
    justifyContent: 'space-between',
  },
  gridText: { fontSize: 14, fontWeight: 'bold' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  input: {
    width: 30,
    borderBottomWidth: 1,
    textAlign: 'center',
    fontSize: 12,
  },
});

export default JantriTab;
