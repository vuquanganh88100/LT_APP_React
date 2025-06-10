import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { fetchCalendarEvents, requestCalendarPermission } from '../service/calendarService';
import { taskService } from '../service/taskService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatusColor, getPriorityStyle } from '../constants/taskConstants';

const getTodayLocal = () => {
  const today = new Date();
  const offsetMs = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offsetMs).toISOString().split('T')[0];
};

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadEvents();
  }, []);

  // Load tasks for today when user is loaded
  useEffect(() => {
    if (user && selectedDate) {
      loadTasksForDate(selectedDate);
    }
  }, [user, loadTasksForDate]);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadTasksForDate = useCallback(async (date) => {
    if (!user) return;
    
    try {
      taskService.getTaskByDate(
        user.userId,
        date,
        (data) => {
          console.log('Tasks for date:', date, data);
          // Format tasks similar to AllTaskScreen
          const formattedTasks = data.map(task => {
            const startDate = new Date(task.startTime);
            const hours = startDate.getHours().toString().padStart(2, '0');
            const minutes = startDate.getMinutes().toString().padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            
            // Normalize priority
            let normalizedPriority = task.priority && task.priority.toLowerCase();
            if (normalizedPriority === 'high') {
              normalizedPriority = 'important';
            } else {
              normalizedPriority = 'normal';
            }
            
            // Normalize status
            let normalizedStatus = task.status && task.status.toLowerCase();
            if (normalizedStatus !== 'pending' && normalizedStatus !== 'in_progress' && normalizedStatus !== 'done') {
              normalizedStatus = 'pending';
            }
            
            return {
              ...task,
              formattedTime,
              priority: normalizedPriority,
              status: normalizedStatus
            };
          });
          
          setSelectedTasks(formattedTasks);
        },
        (error) => {
          console.error('Error loading tasks for date:', error);
          Alert.alert('Lỗi', 'Không thể tải task cho ngày này');
        }
      );
    } catch (error) {
      console.error('Error in loadTasksForDate:', error);
    }
  }, [user]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const granted = await requestCalendarPermission();
      if (!granted) return;

      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      const end = new Date();
      end.setMonth(end.getMonth() + 12);

      const fetched = await fetchCalendarEvents(start.toISOString(), end.toISOString());
      setEvents(fetched);

      const marked = {};
      const today = getTodayLocal();

      fetched.forEach(event => {
        const date = new Date(event.startDate).toISOString().split('T')[0];

        if (!marked[date]) {
          marked[date] = { marked: true, dotColor: '#007bff', events: [] };
        }


        const isVietnameseEvent = /[\u00C0-\u1EF9]/.test(event.title); // Kiểm tra có ký tự tiếng Việt không

        if (isVietnameseEvent) {
          const hasVietnamese = marked[date].events.some(e => /[\u00C0-\u1EF9]/.test(e.title));
          if (!hasVietnamese) {
            marked[date].events.push(event);
          }
        } else {
          const hasVietnamese = marked[date].events.some(e => /[\u00C0-\u1EF9]/.test(e.title));
          if (!hasVietnamese) {
            marked[date].events.push(event);
          }
        }
      });

      if (marked[today]) {
        marked[today] = {
          ...marked[today],
          selected: true,
          selectedColor: '#28a745', // Xanh lá cây
          selectedTextColor: '#ffffff'
        };
      } else {
        marked[today] = {
          selected: true,
          selectedColor: '#28a745',
          selectedTextColor: '#ffffff'
        };
      }

      setMarkedDates(marked);
      setSelectedDate(today);
      setSelectedEvents(marked[today]?.events || []);
      
      // Load tasks for today
      if (user) {
        loadTasksForDate(today);
      }

    } catch (error) {
      console.error('Lỗi tải sự kiện:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDayPress = useCallback((day) => {
    const today = getTodayLocal();
    const dateString = day.dateString;

    setSelectedDate(dateString);

    const newMarked = {};
    Object.keys(markedDates).forEach(date => {
      if (date === today) {
        // Ngày hôm nay luôn giữ màu xanh lá cây
        newMarked[date] = {
          ...markedDates[date],
          selected: true,
          selectedColor: '#28a745',
          selectedTextColor: '#ffffff'
        };
      } else {
        newMarked[date] = {
          ...markedDates[date],
          selected: false,
          selectedColor: undefined,
          selectedTextColor: undefined
        };
      }
    });

    // Nếu click vào ngày khác (không phải hôm nay)
    if (dateString !== today) {
      newMarked[dateString] = {
        ...newMarked[dateString],
        selected: true,
        selectedColor: '#007bff',
        selectedTextColor: '#ffffff'
      };
    }

    setMarkedDates(newMarked);
    setSelectedEvents(newMarked[dateString]?.events || []);
    
    // Load tasks for selected date
    loadTasksForDate(dateString);
  }, [markedDates, loadTasksForDate]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString) => {
    const today = getTodayLocal();
    if (dateString === today) {
      const date = new Date(dateString);
      return `Hôm nay, ${date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}`;
    }
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <Calendar
        current={getTodayLocal()}
        minDate="2024-01-01"
        maxDate="2026-12-31"
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType="simple"
        theme={{
          selectedDayTextColor: '#fff',
          todayTextColor: '#28a745', // Màu text ngày hôm nay
          dotColor: '#007bff',
          arrowColor: '#007bff',
          monthTextColor: '#007bff',
        }}
        firstDay={1}
        enableSwipeMonths={true}
      />

      <ScrollView
        style={styles.eventsContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => loadEvents()}
            colors={['#007bff']}
          />
        }
      >
        <Text style={styles.dateLabel}>{formatDate(selectedDate)}</Text>
        
        {/* Tasks Section */}
        <Text style={styles.sectionTitle}>📋 Công việc</Text>
        {selectedTasks.length > 0 ? (
          selectedTasks.map((task, i) => (
            <TouchableOpacity key={`task-${i}`} style={styles.taskContainer}>
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
                    {task.status === 'pending' && 'Chờ xử lý'}
                    {task.status === 'in_progress' && 'Đang thực hiện'}
                    {task.status === 'done' && 'Hoàn thành'}
                  </Text>
                  <Text
                    style={[
                      styles.priorityTag,
                      getPriorityStyle(task.priority),
                    ]}
                  >
                    {task.priority === 'important' ? 'Quan trọng' : 'Bình thường'}
                  </Text>
                </View>
                
                {task.description && (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                )}
                
                {task.category && (
                  <Text style={styles.taskCategory}>🏷️ {task.category.name}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEvents}>Không có công việc</Text>
        )}

        {/* Events Section */}
        <Text style={styles.sectionTitle}>📅 Sự kiện</Text>
        {selectedEvents.length > 0 ? (
          selectedEvents.map((event, i) => (
            <View key={`event-${i}`} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{event.title || 'Không có tiêu đề'}</Text>
              <Text style={styles.eventTime}>🕐 {formatTime(event.startDate)}</Text>
              {event.location && <Text style={styles.eventLocation}>📍 {event.location}</Text>}
              {event.notes && <Text style={styles.eventNotes}>📝 {event.notes}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.noEvents}>Không có sự kiện</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40
  },
  eventsContainer: {
    flex: 1,
    padding: 16
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333'
  },
  eventItem: {
    backgroundColor: '#f1f3f4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  eventNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666'
  },
  noEvents: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginTop: 20,
    fontStyle: 'italic'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#333'
  },
  // Task styles matching AllTaskScreen
  taskContainer: {
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
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
    color: '#333',
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
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  taskCategory: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 4,
  },
});

export default CalendarScreen;