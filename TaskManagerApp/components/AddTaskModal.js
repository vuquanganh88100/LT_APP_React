import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { taskService } from '../service/taskService';

const AddTaskModal = ({ visible, onClose, category, userId, onTaskAdded, taskToEdit = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [status, setStatus] = useState('pending');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskId, setTaskId] = useState(null);

  // Load task data when editing an existing task
  useEffect(() => {
    if (visible && taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'normal');
      setStatus(taskToEdit.status || 'pending');
      setTaskId(taskToEdit.id);
      
      if (taskToEdit.startTime) {
        setDate(new Date(taskToEdit.startTime));
      }
      
      setIsEditMode(true);
    } else if (visible) {
      // Reset when opening for a new task
      setIsEditMode(false);
      setTaskId(null);
      setStatus('pending');
    }
  }, [visible, taskToEdit]);

  // Reset form when modal closes
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority('normal');
    setStatus('pending');
    setDate(new Date());
    setIsEditMode(false);
    setTaskId(null);
    onClose();
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Format date for display
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Handle saving a task (add or update)
  const handleSaveTask = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    // Prepare task data
    const taskData = {
      title: title,
      description: description || '',
      priority: priority,
      startTime: date.toISOString(),
      userId: userId,
      status: status
    };

    if (isEditMode && taskId) {
      // Update existing task
      taskData.taskId = taskId;
      
      taskService.updateTask(
        taskData,
        (response) => {
          console.log('Task updated successfully:', response);
          handleClose();
          if (onTaskAdded) {
            onTaskAdded();
          }
        },
        (error) => {
          console.error('Error updating task:', error);
          alert('Failed to update task. Please try again.');
        }
      );
    } else {
      // Add new task
      taskService.addTask(
        taskData,
        (response) => {
          console.log('Task added successfully:', response);
          handleClose();
          if (onTaskAdded) {
            onTaskAdded();
          }
        },
        (error) => {
          console.error('Error adding task:', error);
          alert('Failed to add task. Please try again.');
        }
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Edit Task' : `Add Task to ${category}`}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityButtons}>
              {['normal', 'important'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    priority === level && styles.activePriorityButton,
                    { backgroundColor: getPriorityColor(level) }
                  ]}
                  onPress={() => setPriority(level)}
                >
                  <Text style={styles.priorityButtonText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {isEditMode && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusButtons}>
                {['pending', 'in_progress', 'done'].map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption}
                    style={[
                      styles.statusButton,
                      status === statusOption && styles.activeStatusButton,
                      { backgroundColor: getStatusColor(statusOption) }
                    ]}
                    onPress={() => setStatus(statusOption)}
                  >
                    <Text style={styles.statusButtonText}>{statusOption}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formatDate(date)}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleSaveTask}
          >
            <Text style={styles.addButtonText}>
              {isEditMode ? 'Update Task' : 'Add Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Helper function to get color based on priority
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'important':
      return '#e74c3c';
    case 'normal':
    default:
      return '#3498db';
  }
};

// Helper function to get color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'done':
      return '#2ecc71';
    case 'in_progress':
      return '#f39c12';
    case 'pending':
    default:
      return '#95a5a6';
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  activePriorityButton: {
    borderWidth: 2,
    borderColor: '#333',
  },
  priorityButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  activeStatusButton: {
    borderWidth: 2,
    borderColor: '#333',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddTaskModal;