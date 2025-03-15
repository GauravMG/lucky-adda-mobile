import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  console.log(`notification`, notification)

  const showNotification = (
    type,
    title,
    message,
    actionText = null,
    onAction = null
  ) => {
    setNotification({ type, title, message, actionText, onAction });

    // Auto-hide after 2 seconds
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {notification && (
        <CustomNotification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

const CustomNotification = ({
  type,
  title,
  message,
  onClose,
  actionText,
  onAction,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return { icon: require('../assets/tick.jpg'), bgColor: '#28a745' };
      case 'error':
        return { icon: require('../assets/cross.jpg'), bgColor: '#dc3545' };
      case 'info':
      default:
        return { icon: require('../assets/info.jpg'), bgColor: '#007bff' };
    }
  };

  const { icon, bgColor } = getNotificationStyle();

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.animatedView, { opacity: fadeAnim }]}>
        <Image source={icon} style={styles.icon} resizeMode="cover" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {actionText && (
          <TouchableOpacity onPress={onAction} style={styles.actionButton}>
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999999999,
    elevation: 10,
  },
  animatedView: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    zIndex: 9999999999,
    elevation: 10,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  actionButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
