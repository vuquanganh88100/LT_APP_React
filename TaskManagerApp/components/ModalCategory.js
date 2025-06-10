import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { categoryService } from "../service/categoryService";

const ModalCategory = ({ visible, onClose, onAddCategory, userId }) => {
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reset error and form state when modal visibility changes
  useEffect(() => {
    if (visible) {
      // When modal opens, ensure clean state
      setError('');
    } else {
      // When modal closes, reset all states
      setCategoryName('');
      setError('');
      setIsLoading(false);
    }
  }, [visible]);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const addCategorySuccess = (response) => {
        setIsLoading(false);
        onAddCategory(response);
        handleClose();
      };

      const addCategoryError = (error) => {
        setIsLoading(false);
        console.log('API Error Details:', error);
        
        if (error.status === 404) {
          setError('API endpoint not found (404). Check if the category API exists.');
        } else {
          setError('Failed to add category: ' + (error.message || 'Unknown error'));
        }
      };

      await categoryService.addCategory(
        { name: categoryName, userId },
        addCategorySuccess,
        addCategoryError
      );
    } catch (err) {
      setIsLoading(false);
      console.error('Unhandled exception in category add:', err);
      setError('An unexpected error occurred: ' + (err.message || 'Unknown error'));
    }
  };

  const handleClose = () => {
    setError('');
    setCategoryName('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add New Category</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Category Name"
            value={categoryName}
            onChangeText={setCategoryName}
            autoCapitalize="none"
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.addButton]}
              onPress={handleAddCategory}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Adding...' : 'Add Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  }
});

export default ModalCategory;