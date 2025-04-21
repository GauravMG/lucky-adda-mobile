import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  ActivityIndicator,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';

import { requestUserPermission, notificationListener, getFcmToken } from './utils/notificationService';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/messaging';

import { ThemeProvider, useTheme } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext';
import { getItem } from './utils/storage';
import { navigationRef } from './utils/navigation';

import UserBalanceHeader from './components/UserBalanceHeader';
import { BalanceProvider } from './context/BalanceContext';

import LoginScreen from './screens/AuthScreen/LoginScreen';
import RegisterScreen from './screens/AuthScreen/RegisterScreen';
import ForgotPasswordScreen from './screens/AuthScreen/ForgotPasswordScreen';

import HomeScreen from './screens/HomeScreen/HomeScreen';
import AllResultsScreen from './screens/AllResultsScreen';
import AllGamesScreen from './screens/AllGamesScreen';
import GameScreen from './screens/GameScreen/GameScreen';
import PlaceBetScreen from './screens/GameScreen/PlaceBetScreen';
import ResultChartScreen from './screens/HomeScreen/parts/ResultChartScreen';
import TopWinnersScreen from './screens/HomeScreen/parts/TopWinnersScreen';
import PappuPlayingPicturesScreen from './screens/HomeScreen/parts/PappuPlayingPicturesScreen'

import BidHistoryScreen from './screens/BidHistoryScreen';

import WalletScreen from './screens/WalletScreen/WalletScreen';
import AddMoneyScreen from './screens/WalletScreen/AddMoneyScreen';
import WalletOptionScreen from './screens/WalletScreen/WalletOptionScreen';
import WithdrawMoneyScreen from './screens/WalletScreen/WithdrawMoneyScreen';

import ProfileScreen from './screens/Profile/ProfileScreen';

import MoreScreen from './screens/More/MoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const AppLogo = ({ logoStyles }) => (
  <Image
    source={require('./assets/logo.png')}
    style={logoStyles}
    resizeMode="contain"
  />
);

// AuthStack component where we manually handle stack reset
const AuthStack = ({ navigation }) => {
  const { theme } = useTheme();

  const headerOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: theme.toggleBackground,
    },
    headerTintColor: theme.text,
    headerLeft: () => (
      <AppLogo
        logoStyles={{
          width: 30,
          height: 30,
          marginLeft: 10,
          marginRight: 10,
          borderRadius: 8,
        }}
      />
    ),
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={headerOptions}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={headerOptions}
      />
      <Stack.Screen
        name="Forgot Password"
        component={ForgotPasswordScreen}
        options={headerOptions}
      />
    </Stack.Navigator>
  );
};

// WalletStack component where we manually handle stack reset
const WalletStack = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.toggleBackground,
        },
        headerTintColor: theme.text,
        headerRight: () => <UserBalanceHeader />,
      }}>
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        // options={{ headerShown: true }} // Show header for this screen
        options={({ navigation }) => ({
          headerLeft: () => (
            <AppLogo
              logoStyles={{
                width: 30,
                height: 30,
                marginLeft: 10,
                marginRight: 10,
                borderRadius: 8,
              }}
            />
          ),
          headerRight: () => <UserBalanceHeader />,
        })}
      />
      <Stack.Screen
        name="Add Money"
        component={AddMoneyScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.toggleBackground,
          },
          headerTintColor: theme.text,
          headerRight: () => <UserBalanceHeader />,
        }} // Show header for this screen
      />
      <Stack.Screen
        name="Wallet Options"
        component={WalletOptionScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.toggleBackground,
          },
          headerTintColor: theme.text,
          headerRight: () => <UserBalanceHeader />,
        }} // Show header for this screen
      />
    </Stack.Navigator>
  );
};

const HomeTabNavigator = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Bet Now':
              iconName = 'play-circle-outline';
              break;
            case 'Check Results':
              iconName = 'list-outline';
              break;
            case 'Wallet':
              iconName = 'wallet-outline';
              break;
            case 'Bid History':
              iconName = 'time-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
            case 'More':
              iconName = 'ellipsis-horizontal-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.button,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.card,
          paddingBottom: 5,
          borderTopColor: theme.toggleBackground,
        },
        headerShown: false, // Disable header for the TabNavigator itself
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.toggleBackground,
          },
          headerTintColor: theme.text,
          headerLeft: () => (
            <AppLogo
              logoStyles={{
                width: 30,
                height: 30,
                marginLeft: 10,
                marginRight: 10,
                borderRadius: 8,
              }}
            />
          ),
          headerRight: () => <UserBalanceHeader />,
        }}
      />
      <Tab.Screen
        name="Bid History"
        component={BidHistoryScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.toggleBackground,
          },
          headerTintColor: theme.text,
          headerLeft: () => (
            <AppLogo
              logoStyles={{
                width: 30,
                height: 30,
                marginLeft: 10,
                marginRight: 10,
                borderRadius: 8,
              }}
            />
          ),
          headerRight: () => <UserBalanceHeader />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletStack}
        options={{ headerShown: false }} // Show header for this tab
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.toggleBackground,
          },
          headerTintColor: theme.text,
          headerLeft: () => (
            <AppLogo
              logoStyles={{
                width: 30,
                height: 30,
                marginLeft: 10,
                marginRight: 10,
                borderRadius: 8,
              }}
            />
          ),
          headerRight: () => <UserBalanceHeader />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.toggleBackground,
          },
          headerTintColor: theme.text,
          headerLeft: () => (
            <AppLogo
              logoStyles={{
                width: 30,
                height: 30,
                marginLeft: 10,
                marginRight: 10,
                borderRadius: 8,
              }}
            />
          ),
          headerRight: () => <UserBalanceHeader />,
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const jwtToken = await getItem('jwtToken');
        setInitialRoute(jwtToken ? 'HomeScreen' : 'LoginScreen');
      } catch (error) {
        console.error('Error fetching JWT Token:', error);
        setInitialRoute('LoginScreen');
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      await requestUserPermission();
      console.log("Firebase Initialized?", firebase.apps.length > 0);
      console.log("Firebase Config:", firebase.app().options);
      notificationListener();
    };

    initializeNotifications();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <BalanceProvider>
      <NotificationProvider>
        <ThemeProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
              translucent
            />

            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator initialRouteName={initialRoute}>
                <Stack.Screen name="LoginScreen" options={{ headerShown: false }}>
                  {(props) => <AuthStack {...props} />}
                </Stack.Screen>
                <Stack.Screen name="HomeScreen" options={{ headerShown: false }}>
                  {(props) => <HomeTabNavigator {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="AllResultsScreen"
                  component={AllResultsScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Live Results',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="AllGamesScreen"
                  component={AllGamesScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Live Games',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="GameScreen"
                  component={GameScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Play Game',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="PlaceBetScreen"
                  component={PlaceBetScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Place Bet',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="ResultChartScreen"
                  component={ResultChartScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Results Chart',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="TopWinnersScreen"
                  component={TopWinnersScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Top Winners',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="MoreScreen"
                  component={MoreScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'More',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="AddMoneyScreen"
                  component={AddMoneyScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Add Money',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="WalletOptionScreen"
                  component={WalletOptionScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Wallet Options',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="WithdrawMoneyScreen"
                  component={WithdrawMoneyScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: route.params?.title || 'Withdraw Money',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
                <Stack.Screen
                  name="PappuPlayingPicturesScreen"
                  component={PappuPlayingPicturesScreen}
                  options={({ route }) => {
                    const { theme } = useTheme();

                    return {
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: theme.toggleBackground,
                      },
                      headerTintColor: theme.text,
                      title: 'Pappu Playing Pictures',
                      headerRight: () => <UserBalanceHeader />,
                    };
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaView>
        </ThemeProvider>
      </NotificationProvider>
    </BalanceProvider>
  );
};

export default App;
