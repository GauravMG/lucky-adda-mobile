import React, { useEffect, useState } from 'react';
import { Share, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../context/ThemeContext';
import { getItem } from '../utils/storage';

const ShareAppButton = () => {
  const { theme } = useTheme();

  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const userData = await getItem('userData');
        setReferralCode(userData?.referralCode);
      } catch (error) {
        console.error('Error fetching JWT Token:', error);
      }
    };

    checkUserData();
  }, []);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `🌟 Hey friends! 🌟
I’m inviting you to join this amazing app — it's super useful and comes with awesome rewards! 🎉

Join now using my referral code: ${referralCode} and earn exciting rewards right from the start! 💰✨

📲 Download now and start earning!

www.lucky-adda.com?referral-code=${referralCode}

Let’s earn together! 💪`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared via specific app (like WhatsApp, Instagram, etc.)
          console.log('Shared via', result.activityType);
        } else {
          // Shared but app not specified
          console.log('App shared');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share app link');
      console.error('Error sharing app link:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.block, styles.leftBlock, { backgroundColor: theme.card }]}
      onPress={onShare}
      activeOpacity={0.7}>
      <Ionicons
        name="arrow-redo-outline"
        size={15}
        color={theme.button}
        style={{ marginRight: 10 }}
      />
      <Text style={[styles.blockText, { color: theme.text }]}>Share App</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    elevation: 3, // For subtle shadow (optional)
    flexDirection: 'row',
    justifyContent: 'center',
  },
  blockText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ShareAppButton;
