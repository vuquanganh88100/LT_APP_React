import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

//  Cấu hình notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class SimpleNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.isInitialized = false;
  }

  /**
   * 🚀 Khởi tạo notification service
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Simple Notification Service...');

      // Kiểm tra device
      if (!Device.isDevice) {
        console.log('⚠️ Must use physical device for Push Notifications');
        return false;
      }

      // Xin quyền notification
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Failed to get push token for push notification!');
        return false;
      }

      // Lấy push token
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          console.log('⚠️ Project ID not found, using basic notifications');
        }
        
        this.expoPushToken = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('✅ Expo Push Token:', this.expoPushToken);
      } catch (error) {
        console.log('⚠️ Could not get push token, using local notifications only:', error.message);
      }

      this.isInitialized = true;
      console.log('✅ Simple Notification Service initialized successfully');
      
      // Auto-debug notifications on startup
      setTimeout(() => {
        this.debugAllNotificationsOnStartup();
      }, 2000);
      
      return true;

    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * 🔔 Gửi notification ngay lập tức (Local)
   */
  async sendImmediateNotification(title, body, data = {}) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Notification service not initialized');
        return false;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: 'default',
        },
        trigger: null, // Gửi ngay lập tức
      });

      console.log('✅ Immediate notification sent:', notificationId);
      return true;

    } catch (error) {
      console.error('❌ Error sending immediate notification:', error);
      return false;
    }
  }

  /**
   * ⏰ Lên lịch notification cho task
   */
  async scheduleTaskNotification(task) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Notification service not initialized');
        return null;
      }

      const taskDate = new Date(task.startTime);
      const now = new Date();
      
      // 🔍 Debug thông tin thời gian
      console.log('📅 Task scheduling debug:', {
        taskTitle: task.title,
        taskStartTime: task.startTime,
        taskDate: taskDate.toLocaleString('vi-VN'),
        currentTime: now.toLocaleString('vi-VN'),
        taskDateTimestamp: taskDate.getTime(),
        nowTimestamp: now.getTime(),
        isTaskInFuture: taskDate > now
      });
      
      // CHỈ thông báo cho tasks trong khoảng 15 phút tới
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
      const oneMinuteBuffer = 60 * 1000; // 1 phút buffer
      
      // Task đã qua
      if (taskDate.getTime() <= now.getTime()) {
        console.log('⏰ Task đã qua, không thông báo');
        return null;
      }
      
      // Task quá xa trong tương lai (hơn 15 phút) - KHÔNG thông báo
      if (taskDate.getTime() > fifteenMinutesFromNow.getTime()) {
        console.log('⏰ Task quá xa (hơn 15 phút), KHÔNG thông báo:', {
          taskTime: taskDate.toLocaleString('vi-VN'),
          fifteenMinutesFromNow: fifteenMinutesFromNow.toLocaleString('vi-VN'),
          minutesUntilTask: Math.round((taskDate.getTime() - now.getTime()) / (60 * 1000))
        });
        return null;
      }

      // Task trong khoảng 15 phút tới - GỬI THÔNG BÁO NGAY
      console.log('🔔 Task trong 15 phút tới - GỬI THÔNG BÁO NGAY:', {
        taskTime: taskDate.toLocaleString('vi-VN'),
        minutesUntilTask: Math.round((taskDate.getTime() - now.getTime()) / (60 * 1000))
      });

      // Gửi thông báo ngay lập tức
      return await this.sendImmediateNotification(
        '🔔 Task sắp bắt đầu!',
        `"${task.title}" sẽ bắt đầu trong ${Math.round((taskDate.getTime() - now.getTime()) / (60 * 1000))} phút`,
        {
          taskId: task.id,
          taskTitle: task.title,
          type: 'task_immediate_reminder'
        }
      );

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📋 Nhắc nhở công việc',
          body: `"${task.title}" sẽ bắt đầu trong 15 phút`,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            type: 'task_reminder'
          },
          sound: 'default',
        },
        trigger: {
          date: notificationTime,
        },
      });

      console.log('✅ Task notification scheduled:', {
        notificationId,
        taskTitle: task.title,
        notificationTime: notificationTime.toLocaleString('vi-VN')
      });

      // Lưu thông tin notification
      await this.saveScheduledNotification({
        id: notificationId,
        taskId: task.id,
        taskTitle: task.title,
        scheduledTime: notificationTime.toISOString(),
        type: 'task_reminder'
      });

      return notificationId;

    } catch (error) {
      console.error('❌ Error scheduling task notification:', error);
      return null;
    }
  }

  /**
   * ⏰ Lên lịch cho nhiều task (chỉ trong 15 phút tới)
   */
  async scheduleMultipleTaskNotifications(tasks) {
    const results = [];
    const now = new Date();
    
    console.log(`🔄 Bắt đầu lên lịch cho ${tasks.length} tasks...`);
    console.log(`📅 Thời gian hiện tại: ${now.toLocaleString('vi-VN')}`);
    
    // Filter CHỈ lấy tasks trong khoảng 15 phút tới
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    
    const relevantTasks = tasks.filter(task => {
      const taskDate = new Date(task.startTime);
      const minutesUntilTask = Math.round((taskDate.getTime() - now.getTime()) / (60 * 1000));
      
      // Task đã qua
      if (taskDate.getTime() <= now.getTime()) {
        console.log(`⏭️ Bỏ qua task "${task.title}" - đã qua (${taskDate.toLocaleString('vi-VN')})`);
        return false;
      }
      
      // Task quá xa trong tương lai (hơn 15 phút) - KHÔNG thông báo
      if (taskDate.getTime() > fifteenMinutesFromNow.getTime()) {
        console.log(`⏭️ Bỏ qua task "${task.title}" - quá xa (${minutesUntilTask} phút) (${taskDate.toLocaleString('vi-VN')})`);
        return false;
      }
      
      // Task trong 15 phút tới - SẼ thông báo
      console.log(`✅ Task "${task.title}" - trong 15 phút tới (${minutesUntilTask} phút)`);
      return true;
    });
    
    console.log(`📋 Có ${relevantTasks.length}/${tasks.length} tasks trong khoảng 15 phút tới`);
    console.log(`⏰ Khoảng thời gian: ${now.toLocaleString('vi-VN')} → ${fifteenMinutesFromNow.toLocaleString('vi-VN')}`);
    
    for (const task of relevantTasks) {
      const notificationId = await this.scheduleTaskNotification(task);
      if (notificationId) {
        results.push({
          taskId: task.id,
          taskTitle: task.title,
          notificationId
        });
      }
    }
    
    console.log(`✅ Đã GỬI ${results.length}/${relevantTasks.length} thông báo NGAY cho tasks trong 15 phút tới`);
    
    // Debug: Kiểm tra tất cả notifications hiện tại
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const allDelivered = await Notifications.getPresentedNotificationsAsync();
    console.log(`🔍 DEBUG: Hiện có ${allScheduled.length} scheduled + ${allDelivered.length} delivered notifications`);
    
    if (allScheduled.length > 0) {
      console.log('⏰ SCHEDULED NOTIFICATIONS:');
      allScheduled.forEach((notif, index) => {
        const triggerDate = notif.trigger?.date ? new Date(notif.trigger.date) : null;
        console.log(`   ${index + 1}. "${notif.content?.title}" - ${triggerDate ? triggerDate.toLocaleString('vi-VN') : 'No date'}`);
      });
    }
    
    if (allDelivered.length > 0) {
      console.log('📬 DELIVERED NOTIFICATIONS:');
      allDelivered.forEach((notif, index) => {
        console.log(`   ${index + 1}. "${notif.request.content?.title}" - ${notif.date ? new Date(notif.date).toLocaleString('vi-VN') : 'No date'}`);
      });
    }
    
    return results;
  }



  /**
   * 📋 Lấy danh sách notification đã lên lịch
   */
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 Found ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * 🗑️ Hủy notification theo ID
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('🗑️ Notification canceled:', notificationId);
      return true;
    } catch (error) {
      console.error('❌ Error canceling notification:', error);
      return false;
    }
  }

  /**
   * 🗑️ Hủy tất cả notification và clear storage
   */
  async cancelAllNotifications() {
    try {
      // Debug trước khi xóa
      const beforeNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`🔍 Trước khi xóa: ${beforeNotifications.length} notifications`);
      
      beforeNotifications.forEach((notif, index) => {
        const triggerDate = notif.trigger?.date ? new Date(notif.trigger.date) : null;
        console.log(`📋 Notification ${index + 1}:`, {
          id: notif.identifier,
          title: notif.content?.title,
          triggerDate: triggerDate ? triggerDate.toLocaleString('vi-VN') : 'No date'
        });
      });

      // Xóa tất cả
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('scheduledNotifications');
      
      // Verify đã xóa hết
      const afterNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`✅ Sau khi xóa: ${afterNotifications.length} notifications`);
      
      return true;
    } catch (error) {
      console.error('❌ Error canceling all notifications:', error);
      return false;
    }
  }

  /**
   * 🔍 Debug scheduled notifications
   */
  async debugScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const now = new Date();
      
      console.log(`🔍 Debug: Found ${notifications.length} scheduled notifications`);
      console.log(`📅 Current time: ${now.toLocaleString('vi-VN')}`);
      
      notifications.forEach((notification, index) => {
        const triggerDate = notification.trigger?.date ? new Date(notification.trigger.date) : null;
        console.log(`📋 Notification ${index + 1}:`, {
          id: notification.identifier,
          title: notification.content?.title,
          body: notification.content?.body,
          triggerDate: triggerDate ? triggerDate.toLocaleString('vi-VN') : 'No trigger date',
          isInPast: triggerDate ? triggerDate < now : false,
          data: notification.content?.data
        });
      });
      
      return notifications;
    } catch (error) {
      console.error('❌ Error debugging notifications:', error);
      return [];
    }
  }

  /**
   * 🧹 Clean up past notifications
   */
  async cleanupPastNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const now = new Date();
      let cleanedCount = 0;
      
      for (const notification of notifications) {
        const triggerDate = notification.trigger?.date ? new Date(notification.trigger.date) : null;
        
        if (triggerDate && triggerDate < now) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          cleanedCount++;
          console.log(`🧹 Cleaned past notification: ${notification.content?.title}`);
        }
      }
      
      console.log(`🧹 Cleaned ${cleanedCount} past notifications`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Error cleaning past notifications:', error);
      return 0;
    }
  }

  /**
   * 💾 Lưu thông tin notification đã lên lịch
   */
  async saveScheduledNotification(notificationInfo) {
    try {
      const saved = await AsyncStorage.getItem('scheduledNotifications');
      const notifications = saved ? JSON.parse(saved) : [];
      notifications.push(notificationInfo);
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('❌ Error saving notification info:', error);
    }
  }

  /**
   * 📖 Lấy thông tin notification đã lưu
   */
  async getSavedNotifications() {
    try {
      const saved = await AsyncStorage.getItem('scheduledNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('❌ Error getting saved notifications:', error);
      return [];
    }
  }

  /**
   * 🚫 Force clear tất cả notifications và disable auto-scheduling
   */
  async forceClearAndDisable() {
    try {
      console.log('🚫 FORCE CLEAR: Bắt đầu xóa tất cả notifications...');
      
      // 1. Cancel tất cả notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // 2. Clear AsyncStorage
      await AsyncStorage.removeItem('scheduledNotifications');
      
      // 3. Verify clean
      const remaining = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`🧹 FORCE CLEAR: Còn lại ${remaining.length} notifications`);
      
      if (remaining.length > 0) {
        console.log('⚠️ FORCE CLEAR: Vẫn còn notifications, xóa từng cái...');
        for (const notif of remaining) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
          console.log(`🗑️ Đã xóa: ${notif.identifier}`);
        }
      }
      
      // 4. Final check
      const finalCheck = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`✅ FORCE CLEAR: Hoàn thành! Còn lại ${finalCheck.length} notifications`);
      
      return finalCheck.length === 0;
    } catch (error) {
      console.error('❌ FORCE CLEAR Error:', error);
      return false;
    }
  }



  /**
   * 🔍 Debug notifications on startup
   */
  async debugAllNotificationsOnStartup() {
    try {
      console.log('🔍 AUTO-DEBUG: Checking all notifications on startup...');
      
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const delivered = await Notifications.getPresentedNotificationsAsync();
      
      console.log(`📊 STARTUP DEBUG: ${scheduled.length} scheduled + ${delivered.length} delivered notifications`);
      
      if (scheduled.length > 0) {
        console.log('⏰ SCHEDULED NOTIFICATIONS ON STARTUP:');
        scheduled.forEach((notif, index) => {
          const triggerDate = notif.trigger?.date ? new Date(notif.trigger.date) : null;
          const now = new Date();
          const isPast = triggerDate && triggerDate < now;
          console.log(`   ${index + 1}. "${notif.content?.title}" - ${triggerDate ? triggerDate.toLocaleString('vi-VN') : 'No date'} ${isPast ? '(PAST)' : ''}`);
        });
      }
      
      if (delivered.length > 0) {
        console.log('📬 DELIVERED NOTIFICATIONS ON STARTUP:');
        delivered.forEach((notif, index) => {
          console.log(`   ${index + 1}. "${notif.request.content?.title}" - ${notif.date ? new Date(notif.date).toLocaleString('vi-VN') : 'No date'}`);
        });
      }
      
      // Auto-clean past notifications
      if (scheduled.length > 0) {
        console.log('🧹 AUTO-CLEANING past scheduled notifications...');
        const cleaned = await this.cleanupPastNotifications();
        console.log(`🧹 AUTO-CLEANED: ${cleaned} past notifications`);
      }
      
    } catch (error) {
      console.error('❌ Error in startup debug:', error);
    }
  }

  /**
   * 🧹 Cleanup
   */
  cleanup() {
    console.log('🧹 Simple Notification Service cleaned up');
  }
}

// Export singleton instance
export const simpleNotificationService = new SimpleNotificationService();