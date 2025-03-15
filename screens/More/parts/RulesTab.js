import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useTheme } from '../../../context/ThemeContext';

const RulesTab = () => {
  const { theme } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[styles.noteSection, { backgroundColor: theme.cardHighlight }]}>
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.accent }]}>
            Lucky Adda Payment Rules
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Minimum जमा राशि = ₹200/- automatic
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Minimum निकाल राशि = ₹900/-
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - एक दिन में Maximum निकाल राशि = ₹10 लाख/-
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - निकालने का समय - सुबह 10:00 बजे से दोपहर 04:00 बजे तक (एक दिन में
            सिर्फ एक बार निकाल सकते हैं)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.accent }]}>Note:</Text>
          <Text style={[styles.label, { color: theme.primary }]}>
            - सिर्फ जीती हुई राशि ही निकाली जा सकती है।
          </Text>
          <Text style={[styles.label, { color: theme.primary }]}>
            - जीत की राशि रिजल्ट नंबर आने के 15 मिनट बाद Wallet में मिलेगी।
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.accent }]}>
            Game Rates (Bhav)
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - जोड़ी रेट = 100 का 9,000
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - हरुप रेट = 100 का 900
          </Text>
        </View>
      </View>

      <View
        style={[styles.noteSection, { backgroundColor: theme.cardHighlight }]}>
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.accent }]}>
            Lucky Adda Payment Rules
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Minimum deposit amount = ₹200/- automatic
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Minimum withdrawal amount = ₹900/-
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Maximum withdrawal amount per day = ₹10 lakhs/-
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Withdraw timings - 10:00 AM to 04:00 PM (only one time withdraw
            per day)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.accent }]}>Note:</Text>
          <Text style={[styles.label, { color: theme.primary }]}>
            - Only win amount can be withdrawn.
          </Text>
          <Text style={[styles.label, { color: theme.primary }]}>
            - Win amount will be credited to wallet after 15 minutes of result
            number announcement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.accent }]}>
            Game Rates (Bhav)
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Jodi rate = 100 ka 9,000
          </Text>
          <Text style={[styles.label, { color: theme.textHighlight }]}>
            - Harup rate = 100 ka 900
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'flex-start',
    paddingLeft: 20,
    paddingRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteSection: {
    marginVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default RulesTab;
