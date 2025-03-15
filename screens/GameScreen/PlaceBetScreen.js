import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { placeBet } from '../../services/gameService';
import { fetchUserCurrentBalance } from '../../hooks/userBalance';
import { formatINR } from '../../utils/textHelper';

const PlaceBetScreen = ({ route }) => {
  const { game, bets, totalAmount } = route.params;
  const { name } = game;

  const navigation = useNavigation();
  const { theme } = useTheme();
  const showNotification = useNotification();

  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handlePlaceBet = async () => {
    setIsPlacingBet(true);

    try {
      const balance = await fetchUserCurrentBalance();

      if (balance < totalAmount) {
        setIsPlacingBet(false);

        showNotification(
          'error',
          'Low Balance!',
          `You don't have enough balance to place this bet.`
        );
        setTimeout(() => navigation.navigate('Bid History'), 2000);
        return;
      }

      const { success, data } = await placeBet({
        gameId: game.gameId,
        bets,
      });

      if (success) {
        setIsPlacingBet(false);

        showNotification(
          'success',
          'Bet Placed!',
          'Your bet has been placed successfully.'
        );
        setTimeout(() => navigation.navigate('HomeScreen'), 2000);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{name}</Text>

        <Text style={[styles.title, { color: theme.text }]}>
          Confirm Your Bet
        </Text>

        <FlatList
          data={bets}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.betItem, { backgroundColor: theme.card }]}>
              <Text style={[styles.betText, { color: theme.text }]}>
                {item.pair} = ₹ {formatINR(item.amount)}
              </Text>
            </View>
          )}
        />

        <Text style={[styles.totalText, { color: theme.text }]}>
          Total Bet Amount: ₹ {formatINR(totalAmount)}
        </Text>

        <TouchableOpacity
          style={[styles.placeBetButton, { backgroundColor: theme.button }]}
          onPress={handlePlaceBet}
          disabled={isPlacingBet}>
          {isPlacingBet ? (
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Placing Bet...
            </Text>
          ) : (
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Place Bet
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  betItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  betText: { fontSize: 16, fontWeight: 'bold' },
  totalText: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  placeBetButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});

export default PlaceBetScreen;
