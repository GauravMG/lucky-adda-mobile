import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import GameCard from './GameCard';

const GameList = ({ title, games, isLive, refreshScreen, ...props }) => {
  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      numColumns={2}
      renderItem={({ item }) => (
        <GameCard
          {...props}
          key={item.id}
          game={item}
          isLive={isLive}
          refreshScreen={refreshScreen}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({});

export default GameList;
