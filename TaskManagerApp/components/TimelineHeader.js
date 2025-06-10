import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TimelineHeader = ({ title, onAddPress }) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => onAddPress(title.toLowerCase())}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
});

export default TimelineHeader;