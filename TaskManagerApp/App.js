import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, LogBox } from 'react-native';
import { useEffect } from 'react';
import AppNavigation from './navigation/AppNavigation';
import { simpleNotificationService } from './service/simpleNotificationService';
import SilentNotificationWrapper from './components/SilentNotificationWrapper';

// 🚫 CÁCH 3: LogBox.ignoreLogs - Cách mạnh nhất
LogBox.ignoreLogs([
  'expo-notifications',
  'Android Push notifications',
  'removed from Expo Go',
  'development build',
  'not fully supported',
  'Use a development build instead of Expo Go'
]);

// 🚫 Backup: Console override
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = String(args[0] || '');
  if (
    message.includes('expo-notifications') || 
    message.includes('Expo Go') ||
    message.includes('development build') ||
    message.includes('not fully supported') ||
    message.includes('Android Push notifications')
  ) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  const message = String(args[0] || '');
  if (
    message.includes('expo-notifications') || 
    message.includes('Android Push notifications') ||
    message.includes('removed from Expo Go') ||
    message.includes('Use a development build')
  ) {
    return;
  }
  originalError(...args);
};

export default function App() {
  useEffect(() => {
    // 🔔 Khởi tạo simple notification service khi app start
    const initNotifications = async () => {
      const success = await simpleNotificationService.initialize();
      if (success) {
        console.log('✅ Simple Notification service initialized successfully');
      } else {
        console.log('❌ Failed to initialize simple notification service');
      }
    };

    initNotifications();

    // Cleanup khi app unmount
    return () => {
      simpleNotificationService.cleanup();
    };
  }, []);

  return (
    <SilentNotificationWrapper>
      <AppNavigation />
    </SilentNotificationWrapper>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
