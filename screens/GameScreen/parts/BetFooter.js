import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../../context/ThemeContext';
import { useNotification } from '../../../context/NotificationContext';
import { fetchUserCurrentBalance } from '../../../hooks/userBalance';
import { formatINR } from '../../../utils/textHelper';

const BetFooter = ({ game, totalBet, selectedBets }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const placeBet = async () => {
    const balance = await fetchUserCurrentBalance();
    if (Number(balance) < Number(totalBet)) {
      showNotification(
        'error',
        'Low Balance!',
        `You don't have enough balance to place this bet.`
      );
      return;
    }

    navigation.navigate('PlaceBetScreen', {
      game: game,
      bets: selectedBets,
      totalAmount: totalBet,
    });
  };

  return (
    <View
      style={[
        styles.footer,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}>
      {/* Total Bet Display */}
      <Text style={[styles.totalBet, { color: theme.text }]}>
        Total Bet: ₹ {formatINR(totalBet)}
      </Text>

      {/* Place Bet Button */}
      <TouchableOpacity
        style={[
          styles.placeBetButton,
          { backgroundColor: theme.button, opacity: totalBet > 0 ? 1 : 0.5 },
        ]}
        onPress={placeBet}
        disabled={totalBet === 0}>
        <Text style={[styles.placeBetText, { color: theme.buttonText }]}>
          Place Bet
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  totalBet: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeBetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  placeBetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BetFooter;
