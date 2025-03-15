import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { formatTime12Hour } from '../utils/timeHelper';

const ResultList = ({ results, isLive }) => {
  const { theme } = useTheme();

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      numColumns={2}
      renderItem={({ item }) => (
        <View
          style={[
            styles.resultCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          {isLive && (
            <Image
              source={require('../assets/live.gif')}
              style={styles.alertGif}
              resizeMode="contain"
            />
          )}

          {/* Logo */}
          <Image source={{ uri: item.logo }} style={styles.cardImage} />

          {/* Name, City, and Time */}
          <View style={styles.infoContainer}>
            <Text
              style={[styles.resultTitle, { color: theme.text }]}
              numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.resultSubText, { color: theme.text }]}>
              {!isLive
                ? `Open: ${formatTime12Hour(
                    item.startTime
                  )}\nClose: ${formatTime12Hour(item.endTime)}\n`
                : ''}
              Result: {formatTime12Hour(item.resultTime)}
            </Text>
          </View>

          {/* Result Display */}
          {item.gameResultFinal?.resultNumber ? (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: theme.toggleBackground,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}>
              <Text style={[styles.resultText, { color: theme.text }]}>
                {item.gameResultFinal.resultNumber}
              </Text>
            </View>
          ) : isLive ? (
            <View
              style={[
                styles.resultBox,
                {
                  backgroundColor: theme.toggleBackground,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}>
              <Text
                style={[
                  styles.resultText,
                  { color: theme.text, fontSize: 18 },
                ]}>
                Wait
              </Text>
            </View>
          ) : (
            ''
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  resultCard: {
    width: '48%',
    margin: '1%',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 10,
    alignItems: 'center',
    paddingTop: 25,
  },
  cardImage: {
    width: 70,
    height: 70,
    marginBottom: 10,
    borderRadius: 50,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultSubText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  resultBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 50,
    marginTop: 5,
  },
  resultText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
  },
  alertGif: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: -10,
    right: 5,
    zIndex: 1,
    borderRadius: 50,
  },
});

export default ResultList;
