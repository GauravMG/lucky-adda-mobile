import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Linking,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../../../context/ThemeContext';
import { getItem } from '../../../../utils/storage';
import whatsappIcon from '../../../../assets/whatsapp.png';

const ReferEarnTab = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [referralCode, setReferralCode] = useState(null);
  const [totalEarned] = useState(0);

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

  // Function to copy referral code to clipboard
  const copyToClipboard = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard1.');
  };

  // Function to share referral code
  const shareReferral = async () => {
    try {
      const message = `🌟 Hey friends! 🌟
I’m inviting you to join this amazing app — it's super useful and comes with awesome rewards! 🎉

Join now using my referral code: ${referralCode} and earn exciting rewards right from the start! 💰✨

📲 Download now and start earning!

www.lucky-adda.com?referral-code=${referralCode}

Let’s earn together! 💪`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', 'Could not share the referral code.');
    }
  };

  // Function to open WhatsApp with the referral code message
  const inviteViaWhatsApp = async () => {
    const message = encodeURIComponent(
      `🌟 Hey friends! 🌟
I’m inviting you to join this amazing app — it's super useful and comes with awesome rewards! 🎉

Join now using my referral code: ${referralCode} and earn exciting rewards right from the start! 💰✨

📲 Download now and start earning!

www.lucky-adda.com?referral-code=${referralCode}

Let’s earn together! 💪`
    );
    const whatsappUrl = `whatsapp://send?text=${message}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          // Fallback to WhatsApp web if app is not installed
          const webUrl = `https://wa.me?text=${message}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => Alert.alert('Error', 'Could not open WhatsApp'));
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Refer & Earn</Text>

      <View
        style={[styles.noteSection, { backgroundColor: theme.cardHighlight }]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Text style={[styles.noteLabel, { color: theme.textHighlight }]}>
              Share Lucky Add App with{'\n'}
              Friends, Secure & Trusted
            </Text>
            <Text
              style={[
                styles.noteLabel,
                { color: theme.textHighlight, fontSize: 15 },
              ]}>
              1% Commission on Every{'\n'}
              Deposit, Forever Unlock{'\n'}
              Exclusive Rewards
            </Text>
          </View>
          <Image
            source={require('../../../../assets/refer-friend.jpg')}
            style={{
              width: 90,
              height: 90,
              borderRadius: 8,
              borderWidth: 1,
            }}
            resizeMode="cover"
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Ionicons name="arrow-redo-outline" size={15} color={theme.accent} />
          <Text
            style={[
              styles.noteLabel,
              {
                color: theme.accent,
                marginLeft: 5,
                marginBottom: 0,
                fontSize: 16,
              },
            ]}>
            Share Now, Earn Always
          </Text>
        </View>
      </View>

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Invite friends and earn rewards!
        </Text>

        {/* Referral Code Label */}
        <Text style={[styles.referralLabel, { color: theme.text }]}>
          Your Referral Code:
        </Text>

        {/* Referral Code Box with Dotted Border */}
        <View style={[styles.codeBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.codeText, { color: theme.text }]}>
            {referralCode}
          </Text>
          <TouchableOpacity
            onPress={copyToClipboard}
            style={[styles.copyButton, { backgroundColor: theme.button }]}>
            <Text style={[styles.copyButtonText, { color: theme.buttonText }]}>
              Copy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Earned */}
        {/* <View style={[styles.earningsBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.earningsText, { color: theme.text }]}>
            Total Earned: ₹{totalEarned}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Referral History')}
            style={styles.historyButton}>
            <Text style={styles.historyButtonText}>View Referral History</Text>
          </TouchableOpacity>
        </View> */}

        <Text
          style={[
            styles.noteLabel,
            { color: theme.textHighlight, marginTop: 10, width: '100%' },
          ]}>
          ऊपर दिया गया कोड आपका रेफ़रल कोड है
        </Text>

        <View style={[styles.noteSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.noteLabel, { color: theme.primary }]}>
            Lucky Adda App शेयर करें और 1% कमीशन पाएँ
          </Text>
          <Text style={[styles.noteLabel, { color: theme.success }]}>
            अपने दोस्त के हर डिपॉज़िट पर 1% commission
          </Text>
          <Text style={[styles.noteLabel, { color: theme.accent }]}>
            लाइफटाइम वैधता, अनलिमिटेड बेनिफिट्स
          </Text>
          <Text style={[styles.noteLabel, { color: theme.textHighlight }]}>
            अब शेयर करें और अपने दोस्तों को Download करवाएँ
          </Text>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: theme.button }]}
          onPress={shareReferral}>
          <Ionicons
            name="arrow-redo-outline"
            size={18}
            color={theme.buttonText}
          />
          <Text style={[styles.shareButtonText, { color: theme.buttonText }]}>
            Share Referral Code
          </Text>
        </TouchableOpacity>

        {/* Invite via WhatsApp Button */}
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: theme.button }]} // WhatsApp Green Color
          onPress={inviteViaWhatsApp}>
          <Image source={whatsappIcon} style={styles.icon} />
          <Text style={[styles.shareButtonText, { color: theme.buttonText }]}>
            Invite via WhatsApp
          </Text>
        </TouchableOpacity>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  referralLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dotted', // Dotted border
    marginBottom: 20,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  copyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  earningsBox: {
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  earningsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  noteSection: {
    marginVertical: 30,
    alignItems: 'left',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
});

export default ReferEarnTab;
