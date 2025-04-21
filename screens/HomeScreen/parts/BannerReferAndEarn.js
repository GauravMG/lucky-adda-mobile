import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../../context/ThemeContext';
import { AppLogo } from '../../../App';
import { getItem } from '../../../utils/storage';

const BannerReferAndEarn = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [appSettingData, setAppSettingData] = useState(null)

  useEffect(() => {
    const getAppSettingData = async () => {
      const appMaintenanceData = await getItem('appSettingData');
      setAppSettingData(appMaintenanceData)
    };

    getAppSettingData();
  }, []);

  return (
    <TouchableOpacity
      style={[
        styles.noteSection,
        {
          backgroundColor: theme.cardHighlight,
        },
      ]}
      onPress={() =>
        navigation.navigate('MoreScreen', {
          tab: 'Refer & Earn',
          title: 'More',
        })
      }
      activeOpacity={0.7}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <AppLogo
          logoStyles={{
            width: 20,
            height: 20,
            borderRadius: 8,
          }}
        />
        <Text
          style={[
            styles.noteLabel,
            {
              color: theme.primary,
              borderBottomWidth: 1,
              borderBottomColor: theme.primary,
              fontSize: 16,
              marginHorizontal: 20,
            },
          ]}>
          Lucky Adda - Share & Earn
        </Text>
        <AppLogo
          logoStyles={{
            width: 20,
            height: 20,
            borderRadius: 8,
          }}
        />
      </View>
      <Text style={[styles.noteLabel, { color: theme.textHighlight }]}>
        अपने दोस्तों से Lucky Adda ऐप डाउनलोड करवाएँ|
      </Text>
      <Text style={[styles.noteLabel, { color: theme.success }]}>
        आपको हर मनी डिपॉज़िट पर लाइफ-टाइम {appSettingData?.amountReferral}% कमीशन मिलेगा|
      </Text>
      <Text style={[styles.noteLabel, { color: theme.accent }]}>
        Share Lucky Adda App with friends & get{'\n'}
        {appSettingData?.amountReferral}% commission on every deposit
      </Text>
      <Text style={[styles.noteLabel, { color: theme.textHighlight }]}>
        ज्यादा दोस्तों को Lucky Adda ऐप शेयर करें और ज्यादा पैसे कमाएँ
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteSection: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flex: 1,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
});

export default BannerReferAndEarn;
