// 🚫 CÁCH 4: Silent Notification Wrapper
import React, { useEffect } from 'react';

const SilentNotificationWrapper = ({ children }) => {
  useEffect(() => {
    // Override console methods before any notification imports
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;

    console.warn = (...args) => {
      const message = String(args[0] || '');
      if (
        message.includes('expo-notifications') || 
        message.includes('Android Push notifications') ||
        message.includes('removed from Expo Go') ||
        message.includes('development build') ||
        message.includes('not fully supported')
      ) {
        return; // Silent
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
        return; // Silent
      }
      originalError(...args);
    };

    // Cleanup on unmount
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
      console.log = originalLog;
    };
  }, []);

  return children;
};

export default SilentNotificationWrapper;