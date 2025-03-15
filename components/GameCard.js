import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import { useTheme } from '../context/ThemeContext';
import { formatTime12Hour } from '../utils/timeHelper';

const GameCard = ({ game, isLive, refreshScreen }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const { name } = game;

  const checkIfGameLive = ({ startTime, endTime }) => {
    const currentTime = dayjs().format('HH:mm');

    if (game.startTime <= game.endTime) {
      return startTime <= currentTime && endTime >= currentTime;
    } else {
      return startTime <= currentTime || endTime >= currentTime;
    }
  };

  const handlePlayNow = () => {
    if (checkIfGameLive(game)) {
      navigation.navigate('GameScreen', { game, title: name });
    } else {
      Alert.alert('Game closed!', 'This game has already closed for now.');
      refreshScreen();
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}>
      {/* Live Players Badge */}
      {isLive && game.livePlayers && (
        <View
          style={[
            styles.livePlayersContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Text style={[styles.livePlayers, { color: theme.text }]}>
            Live Players {game.livePlayers}+
          </Text>
        </View>
      )}

      <Image source={{ uri: game.logo }} style={styles.cardImage} />
      <Text style={[styles.gameTitle, { color: theme.text }]}>{game.name}</Text>
      <Text style={[styles.gameTime, { color: theme.text }]}>
        {!isLive ? `Open: ${formatTime12Hour(game.startTime)}\n` : ''}
        Close: {formatTime12Hour(game.endTime)}
        {'\n'}Result: {formatTime12Hour(game.resultTime)}
      </Text>
      {isLive && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button }]}
          onPress={() => handlePlayNow()}>
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Play Now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    margin: '1%',
    padding: 15,
    paddingTop: 30,
    borderWidth: 1,
    borderRadius: 10,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  livePlayersContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    zIndex: 10,
  },
  livePlayers: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
    borderRadius: 50,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameTime: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GameCard;
