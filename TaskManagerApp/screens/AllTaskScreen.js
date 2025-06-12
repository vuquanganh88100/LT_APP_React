import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { taskService } from '../service/taskService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimelineHeader from '../components/TimelineHeader';
import AddTaskModal from '../components/AddTaskModal';
import { getStatusColor, getPriorityStyle } from '../constants/taskConstants';
import { simpleNotificationService } from '../service/simpleNotificationService';
import { Ionicons } from '@expo/vector-icons';

const TaskList = ({ title, tasks, onAddPress, onTaskPress }) => (
  <View style={styles.section}>
    <TimelineHeader title={title} onAddPress={onAddPress} />
    {tasks.length === 0 ? (
      <Text style={styles.noTask}>No tasks</Text>
    ) : (
      tasks.map(task => (
        <TouchableOpacity key={task.id} onPress={() => onTaskPress(task)}>
          <View
          style={[
            styles.taskItem,
            { borderLeftColor: getStatusColor(task.status), borderLeftWidth: 6 },
          ]}
        >
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskTime}>{task.formattedTime}</Text>
          </View>
          <View style={styles.taskMeta}>
            <Text style={{ color: getStatusColor(task.status), fontWeight: 'bold' }}>
              {task.status}
            </Text>
            <Text
              style={[
                styles.priorityTag,
                getPriorityStyle(task.priority),
              ]}
            >
              {task.priority}
            </Text>
          </View>
          </View>
        </TouchableOpacity>
      ))
    )}
  </View>
);

const AllTaskScreen = () => {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  // Function to fetch tasks
  const fetchTasks = async (userId) => {
    return new Promise((resolve, reject) => {
      taskService.getTask(
        userId,
        (response) => {
          // Process tasks after successful fetch
          const formattedTasks = response.map(task => {
            const startDate = new Date(task.startTime);
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            
            // Format the time to display hours and minutes
            const hours = startDate.getHours().toString().padStart(2, '0');
            const minutes = startDate.getMinutes().toString().padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            
            let dateCategory = 'someday';
            
            // Check if the date is in the past (before today)
            if (startDate < today && startDate.toDateString() !== today.toDateString()) {
              dateCategory = 'before';
            } else if (startDate.toDateString() === today.toDateString()) {
              dateCategory = 'today';
            } else if (startDate.toDateString() === tomorrow.toDateString()) {
              dateCategory = 'tomorrow';
            }
            
            // Normalize priority to either 'normal' or 'important'
            let normalizedPriority = task.priority && task.priority.toLowerCase();
            if (normalizedPriority !== 'important') {
              normalizedPriority = 'normal';
            }
            
            // Normalize status to match API values
            let normalizedStatus = task.status && task.status.toLowerCase();
            if (normalizedStatus !== 'pending' && normalizedStatus !== 'in_progress' && normalizedStatus !== 'done') {
              normalizedStatus = 'pending';
            }
            
            return {
              id: task.taskId,
              title: task.title,
              description: task.description,
              status: normalizedStatus,
              priority: normalizedPriority,
              date: dateCategory,
              startTime: task.startTime, // Store the original startTime for sorting
              formattedTime: formattedTime // Store the formatted time for display
            };
          });
          
          // Sort tasks by startTime
          formattedTasks.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          
          // 🔔 Tự động lên lịch thông báo cho các task
          simpleNotificationService.scheduleMultipleTaskNotifications(formattedTasks);
          
          resolve(formattedTasks);
        },
        (error) => {
          console.error('Error fetching tasks:', error);
          reject(error);
        }
      );
    });
  };

  // Handle refresh when pull down
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        const freshTasks = await fetchTasks(user.userId);
        setTasks(freshTasks);
        setError(null);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      setError("Failed to refresh tasks");
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  // Load data initially
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user data from AsyncStorage
        const userDataString = await AsyncStorage.getItem('user');
        if (!userDataString) {
          console.warn("User not logged in");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userDataString);
        setUserId(user.userId);
        
        // Use the fetchTasks function
        try {
          const formattedTasks = await fetchTasks(user.userId);
          setTasks(formattedTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
          setError("Failed to load tasks");
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error processing task data:', error);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };
    getData();
  }, []);

  const beforeTasks = tasks.filter(task => task.date === 'before');
  const todayTasks = tasks.filter(task => task.date === 'today');
  const tomorrowTasks = tasks.filter(task => task.date === 'tomorrow');
  const somedayTasks = tasks.filter(task => task.date === 'someday');
  
  // Handle opening the add task modal
  const handleAddPress = (category) => {
    setSelectedCategory(category);
    setTaskToEdit(null); // Make sure we're in add mode, not edit mode
    setModalVisible(true);
  };
  
  // Handle opening the edit task modal
  const handleTaskPress = (task) => {
    setTaskToEdit(task);
    setSelectedCategory(task.date);
    setModalVisible(true);
  };
  
  // Handle task added or updated successfully
  const handleTaskAdded = async () => {
    // Refresh the task list
    if (userId) {
      try {
        setRefreshing(true);
        const freshTasks = await fetchTasks(userId);
        setTasks(freshTasks);
      } catch (error) {
        console.error('Error refreshing tasks after add:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  // 🚫 FORCE CLEAR notifications
  const handleForceClear = async () => {
    Alert.alert(
      '🚫 FORCE CLEAR',
      'Xóa TẤT CẢ notifications (scheduled + delivered)?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: '🚫 FORCE CLEAR',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await simpleNotificationService.forceClearAndDisable();
              Alert.alert(
                success ? '✅ CLEARED' : '❌ Lỗi',
                success ? 'Đã xóa TẤT CẢ notifications!' : 'Có lỗi xảy ra'
              );
            } catch (error) {
              console.error('Error force clearing:', error);
              Alert.alert('❌ Lỗi', 'Không thể force clear');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3498db"]}
            tintColor="#3498db"
            title="Refreshing tasks..."
            titleColor="#666"
          />
        }
      >
        <TaskList title="Before" tasks={beforeTasks} onAddPress={handleAddPress} onTaskPress={handleTaskPress} />
        <TaskList title="Today" tasks={todayTasks} onAddPress={handleAddPress} onTaskPress={handleTaskPress} />
        <TaskList title="Tomorrow" tasks={tomorrowTasks} onAddPress={handleAddPress} onTaskPress={handleTaskPress} />
        <TaskList title="Someday" tasks={somedayTasks} onAddPress={handleAddPress} onTaskPress={handleTaskPress} />
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <AddTaskModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={selectedCategory}
        userId={userId}
        onTaskAdded={handleTaskAdded}
        taskToEdit={taskToEdit}
        timeType={selectedCategory} // Truyền timeType để xác định ngày mặc định
      />
      
      {/* Floating FORCE CLEAR button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleForceClear}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text style={styles.floatingButtonText}>CLEAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  bottomPadding: {
    height: 40, // Extra space at the bottom
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noTask: {
    fontStyle: 'italic',
    color: 'gray',
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  taskTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#dc3545',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 12,
  },
});

export default AllTaskScreen;
