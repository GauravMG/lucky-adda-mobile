import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../context/ThemeContext';

const HelpButton = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[
        styles.block,
        {
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
        },
      ]}
      onPress={() =>
        navigation.navigate('MoreScreen', { tab: 'Help', title: 'More' })
      }
      activeOpacity={0.7}>
      <Ionicons name="headset-outline" size={15} color={theme.button} />
      <Text style={[styles.blockText, { color: theme.text }]}>Help</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  block: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    elevation: 3, // For subtle shadow (optional)
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  blockText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 5,
  },
});

export default HelpButton;
