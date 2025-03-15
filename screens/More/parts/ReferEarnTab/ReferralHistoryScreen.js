import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { useTheme } from '../../../../context/ThemeContext';

const ReferralHistoryScreen = () => {
  const { theme } = useTheme();

  // Example referral data
  const [referrals] = useState([
    { id: '1', name: 'Rahul Sharma', status: 'Completed', amount: 500 },
    { id: '2', name: 'Ankit Verma', status: 'Pending', amount: 0 },
    { id: '3', name: 'Neha Gupta', status: 'Completed', amount: 1000 },
    { id: '4', name: 'Pooja Mehra', status: 'Pending', amount: 0 },
  ]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Referral History
      </Text>

      <FlatList
        data={referrals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderLeftColor: item.status === 'Completed' ? 'green' : 'red',
              },
            ]}>
            <Text style={[styles.name, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text
              style={[
                styles.status,
                { color: item.status === 'Completed' ? 'green' : 'red' },
              ]}>
              {item.status}
            </Text>
            {item.status === 'Completed' && (
              <Text style={[styles.amount, { color: theme.text }]}>
                Earned: ₹{item.amount}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    marginTop: 5,
  },
  amount: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default ReferralHistoryScreen;
