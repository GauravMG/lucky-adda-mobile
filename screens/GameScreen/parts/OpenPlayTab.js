import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../../context/ThemeContext';
import { formatINR } from '../../../utils/textHelper';

const OpenPlayTab = ({ updateTotalBet, selectedBets, setSelectedBets }) => {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [number1, setNumber1] = useState('');
  const [palti, setPalti] = useState(false);
  const [amount1, setAmount1] = useState('');
  const [number2, setNumber2] = useState('');
  const [aChecked, setAChecked] = useState(false);
  const [bChecked, setBChecked] = useState(false);
  const [amount2, setAmount2] = useState('');
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    if (activeRow === 1) generatePairsFirstRow();
    if (activeRow === 2) generatePairsSecondRow();
  }, [number1, palti, amount1, number2, aChecked, bChecked, amount2]);

  useFocusEffect(
    useCallback(() => {
      return () => resetAll();
    }, [])
  );

  const resetAll = () => {
    setNumber1('');
    setPalti(false);
    setAmount1('');
    setNumber2('');
    setAChecked(false);
    setBChecked(false);
    setAmount2('');
    setSelectedBets([]);
    updateTotalBet(0);
  };

  const handleRowSwitch = (row) => {
    if (activeRow !== row) {
      resetAll();
      setActiveRow(row);
    }
  };

  const generatePairsFirstRow = () => {
    setLoading(true);
    if (
      !number1 ||
      number1.length % 2 !== 0 ||
      isNaN(amount1) ||
      amount1 <= 0
    ) {
      setSelectedBets([]);
      updateTotalBet(0);
      setLoading(false);
      return;
    }

    const pairs = [];
    const pairNumbers = [];
    for (let i = 0; i < number1.length; i += 2) {
      const pair = number1.substring(i, i + 2);
      if (!pairNumbers.includes(pair)) {
        pairs.push({
          pair,
          amount: amount1,
          pairType: 'jodi',
        });
        pairNumbers.push(pair);
        if (palti) {
          if (!pairNumbers.includes(pair.split('').reverse().join(''))) {
            pairs.push({
              pair: pair.split('').reverse().join(''),
              amount: amount1,
              pairType: 'jodi',
            });
            pairNumbers.push(pair.split('').reverse().join(''));
          }
        }
      }
    }

    setSelectedBets(pairs);
    updateTotalBet(pairs.length * Number(amount1));
    setLoading(false);
  };

  const generatePairsSecondRow = () => {
    setLoading(true);
    if (
      !number2 ||
      (!aChecked && !bChecked) ||
      isNaN(amount2) ||
      amount2 <= 0
    ) {
      setSelectedBets([]);
      updateTotalBet(0);
      setLoading(false);
      return;
    }

    const pairs = [];
    const pairNumbers = [];
    for (let i = 0; i < number2.length; i++) {
      if (!pairNumbers.includes(`A${number2[i]}`)) {
        if (aChecked)
          pairs.push({
            pair: `A${number2[i]}`,
            amount: amount2,
            pairType: 'harup',
          });
        pairNumbers.push(`A${number2[i]}`);
      }
      if (!pairNumbers.includes(`B${number2[i]}`)) {
        if (bChecked)
          pairs.push({
            pair: `B${number2[i]}`,
            amount: amount2,
            pairType: 'harup',
          });
        pairNumbers.push(`B${number2[i]}`);
      }
    }

    setSelectedBets(pairs);
    updateTotalBet(pairs.length * Number(amount2));
    setLoading(false);
  };

  const removePair = (index) => {
    const updatedPairs = [...selectedBets];
    updatedPairs.splice(index, 1);
    setSelectedBets(updatedPairs);
    updateTotalBet(
      updatedPairs.length
        ? updatedPairs.length *
            Number(updatedPairs[updatedPairs.length - 1].amount)
        : 0
    );
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
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter Number"
          keyboardType="number-pad"
          placeholderTextColor={theme.text}
          value={number1}
          onChangeText={(text) => {
            handleRowSwitch(1);
            setNumber1(text.replace(/\D/g, ''));
          }}
        />
        <View style={styles.checkboxContainer}>
          <BouncyCheckbox
            size={20}
            fillColor={theme.accent}
            unfillColor={theme.background}
            text="With Palti"
            textStyle={{ textDecorationLine: 'none', color: theme.text }}
            isChecked={palti}
            onPress={() => {
              handleRowSwitch(1);
              setPalti(!palti);
            }}
          />
        </View>
        <Text style={[styles.label, { color: theme.text }]}>Bet Amount:</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter Amount"
          keyboardType="number-pad"
          placeholderTextColor={theme.text}
          value={amount1}
          onChangeText={(text) => setAmount1(text.replace(/\D/g, ''))}
        />

        <Text
          style={[
            styles.label,
            { color: theme.text, float: 'center', marginBottom: 20 },
          ]}>
          OR
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Enter Number:</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter Number"
          keyboardType="number-pad"
          placeholderTextColor={theme.text}
          value={number2}
          onChangeText={(text) => {
            handleRowSwitch(2);
            setNumber2(text.replace(/\D/g, ''));
          }}
        />
        <Text style={[styles.label, { color: theme.text }]}>Select Harup:</Text>
        <View style={styles.checkboxContainer}>
          <BouncyCheckbox
            size={20}
            fillColor={theme.accent}
            unfillColor={theme.background}
            text="A"
            textStyle={{ textDecorationLine: 'none', color: theme.text }}
            isChecked={aChecked}
            disableBuiltInState
            onPress={() => {
              handleRowSwitch(2);
              setAChecked(!aChecked);
            }}
          />
        </View>
        <View style={styles.checkboxContainer}>
          <BouncyCheckbox
            size={20}
            fillColor={theme.accent}
            unfillColor={theme.background}
            text="B"
            textStyle={{ textDecorationLine: 'none', color: theme.text }}
            isChecked={bChecked}
            disableBuiltInState
            onPress={() => {
              handleRowSwitch(2);
              setBChecked(!bChecked);
            }}
          />
        </View>
        <Text style={[styles.label, { color: theme.text }]}>Bet Amount:</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text },
          ]}
          placeholder="Enter Amount"
          keyboardType="number-pad"
          placeholderTextColor={theme.text}
          value={amount2}
          onChangeText={(text) => setAmount2(text.replace(/\D/g, ''))}
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

        {/* Extra bottom padding */}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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

export default OpenPlayTab;
