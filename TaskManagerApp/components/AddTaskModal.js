import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ScrollView
} from 'react-native';
import { categoryService } from '../service/categoryService';
import { taskService } from '../service/taskService';
import { getStatusColor, getPriorityStyle } from '../constants/taskConstants';
import { simpleNotificationService } from '../service/simpleNotificationService';

const AddTaskModal = ({ 
  visible, 
  onClose, 
  userId, 
  onTaskAdded, 
  taskToEdit = null,
  timeType = 'today' // Thêm prop timeType: 'today', 'tomorrow', 'someday', 'before'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [status, setStatus] = useState('pending');
  const [dateInputText, setDateInputText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Hàm tạo thời gian mặc định dựa trên timeType
  const getDefaultDateTime = (type) => {
    const now = new Date();
    const defaultTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0); // 9:00 AM
    
    switch (type) {
      case 'today':
        return new Date(); // Giờ hiện tại
      case 'tomorrow':
        const tomorrow = new Date(defaultTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      case 'someday':
        const someday = new Date(defaultTime);
        someday.setDate(someday.getDate() + 2);
        return someday;
      case 'before':
        return new Date(); // Không sử dụng vì sẽ ẩn modal
      default:
        return new Date();
    }
  };

  useEffect(() => {
    if (visible && userId) {
      categoryService.getCategories(
        userId,
        (response) => {
          const categoriesData = Array.isArray(response) ? response : (response.data || []);
          setCategories(categoriesData);
          if (!selectedCategory && categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0].categoryId);
          }
        },
        (error) => console.error('Error loading categories:', error)
      );
    }
  }, [visible, userId]);

  useEffect(() => {
    if (visible && taskToEdit) {
      // Mode chỉnh sửa task
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'normal');
      setStatus(taskToEdit.status || 'pending');
      setTaskId(taskToEdit.id);
      
      if (taskToEdit.startTime) {
        const newDate = new Date(taskToEdit.startTime);
        setDateInputText(formatDate(newDate));
      }
      
      if (taskToEdit.categoryId) {
        setSelectedCategory(taskToEdit.categoryId);
      }
      
      setIsEditMode(true);
    } else if (visible) {
      // Mode thêm task mới - sử dụng thời gian dựa trên timeType
      const defaultDate = getDefaultDateTime(timeType);
      setDateInputText(formatDate(defaultDate));
      setIsEditMode(false);
      setTaskId(null);
      setStatus('pending');
    }
  }, [visible, taskToEdit, timeType]);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPriority('normal');
    setStatus('pending');
    setDateInputText('');
    setIsEditMode(false);
    setTaskId(null);
    onClose();
  };

  const formatDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  
  const parseDate = (dateString) => {
    if (!dateString || dateString.trim() === '') return new Date();
    
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    } catch (e) {
      return new Date();
    }
  };

  const handleSaveTask = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    const date = parseDate(dateInputText);
    const formatDateToLocalISOString = (date) => {
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    
    const taskData = {
      title: title,
      description: description || '',
      priority: priority,
      startTime: formatDateToLocalISOString(date),
      userId: userId,
      status: status,
      categoryId: selectedCategory
    };

    if (isEditMode && taskId) {
      taskData.taskId = taskId;
      taskService.updateTask(taskData, 
        async (response) => { 
          // 🔔 Lên lịch thông báo cho task đã update
          await simpleNotificationService.scheduleTaskNotification({
            id: taskId,
            title: taskData.title,
            startTime: taskData.startTime
          });
          
          handleClose(); 
          onTaskAdded && onTaskAdded(); 
        },
        (error) => alert('Failed to update task. Please try again.'),
      );
    } else {
      taskService.addTask(taskData,
        async (response) => { 
          // 🔔 Lên lịch thông báo cho task mới tạo
          if (response && response.taskId) {
            await simpleNotificationService.scheduleTaskNotification({
              id: response.taskId,
              title: taskData.title,
              startTime: taskData.startTime
            });
          }
          
          handleClose(); 
          onTaskAdded && onTaskAdded(); 
        },
        (error) => alert('Failed to add task. Please try again.')
      );
    }
  };

  // Chỉ ẩn modal khi timeType là 'before' và không phải là edit mode
  if (timeType === 'before' && !isEditMode) {
    return null;
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditMode ? 'Edit Task' : 'Add Task'}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
          />
          
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            multiline
          />
          
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tags}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.categoryId}
                    style={[styles.tag, selectedCategory === cat.categoryId && styles.tagActive]}
                    onPress={() => setSelectedCategory(cat.categoryId)}
                  >
                    <Text style={[styles.tagText, selectedCategory === cat.categoryId && styles.tagTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.buttons}>
              {['normal', 'important'].map((level) => {
                const isActive = priority === level;
                const priorityStyle = getPriorityStyle(level);
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.btn, 
                      isActive && styles.btnActive,
                      isActive && { backgroundColor: priorityStyle.backgroundColor }
                    ]}
                    onPress={() => setPriority(level)}
                  >
                    <Text style={[styles.btnText, isActive && styles.btnTextActive]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          {isEditMode && (
            <View style={styles.section}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.buttons}>
                {['pending', 'progress', 'done'].map((s) => {
                  const actualStatus = s === 'progress' ? 'in_progress' : s;
                  const isActive = status === actualStatus;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.btn, 
                        isActive && styles.btnActive,
                        isActive && { backgroundColor: getStatusColor(actualStatus) }
                      ]}
                      onPress={() => setStatus(actualStatus)}
                    >
                      <Text style={[styles.btnText, isActive && styles.btnTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.label}>Date & Time</Text>
            <TextInput
              style={styles.input}
              value={dateInputText}
              onChangeText={setDateInputText}
              placeholder="dd/mm/yyyy hh:mm"
            />
          </View>
          
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTask}>
            <Text style={styles.saveBtnText}>
              {isEditMode ? 'Update' : 'Add'} Task
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  close: {
    fontSize: 24,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  tagTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  half: {
    flex: 1,
    marginRight: 10,
  },
  buttons: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: '#007AFF',
  },
  btnText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  btnTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTaskModal;