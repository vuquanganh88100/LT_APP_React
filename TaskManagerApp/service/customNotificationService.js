// 🔔 CÁCH 5: Custom Notification Service - Không dùng expo-notifications
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class CustomNotificationService {
  constructor() {
    this.isInitialized = false;
    this.scheduledNotifications = new Map();
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Custom Notification Service...');
      this.isInitialized = true;
      console.log('✅ Custom Notification Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize custom notification service:', error);
      return false;
    }
  }

  async scheduleNotification(task) {
    try {
      // Simulate notification scheduling với Alert
      const notificationId = `task_${task.id}_${Date.now()}`;
      
      // Store notification info
      this.scheduledNotifications.set(notificationId, {
        id: notificationId,
        taskId: task.id,
        title: task.title,
        scheduledTime: task.dateTime,
        created: new Date().toISOString()
      });

      console.log(`📅 Scheduled notification for task: ${task.title}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId) {
    try {
      if (this.scheduledNotifications.has(notificationId)) {
        this.scheduledNotifications.delete(notificationId);
        console.log(`🚫 Cancelled notification: ${notificationId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
      return false;
    }
  }

  async getAllScheduledNotifications() {
    return Array.from(this.scheduledNotifications.values());
  }

  async forceClearAndDisable() {
    try {
      this.scheduledNotifications.clear();
      console.log('🚫 Force cleared all custom notifications');
      return true;
    } catch (error) {
      console.error('❌ Error force clearing:', error);
      return false;
    }
  }

  async scheduleTaskNotifications(tasks) {
    if (!this.isInitialized) {
      console.log('⚠️ Custom notification service not initialized');
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const task of tasks) {
      const notificationId = await this.scheduleNotification(task);
      if (notificationId) {
        success++;
      } else {
        failed++;
      }
    }

    console.log(`📊 Custom notifications: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  cleanup() {
    this.scheduledNotifications.clear();
    this.isInitialized = false;
    console.log('🧹 Custom notification service cleaned up');
  }
}

export const customNotificationService = new CustomNotificationService();