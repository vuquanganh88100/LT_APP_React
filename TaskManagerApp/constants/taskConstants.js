// Task status colors
export const TASK_STATUS_COLORS = {
  in_progress: '#f39c12', // Orange
  done: '#2ecc71',        // Green
  pending: '#95a5a6',     // Gray
  default: '#95a5a6'      // Default (Gray)
};

// Task priority colors
export const TASK_PRIORITY_STYLES = {
  important: { 
    backgroundColor: '#e74c3c', 
    color: 'white' 
  },
  normal: { 
    backgroundColor: '#3498db', 
    color: 'white' 
  },
  default: { 
    backgroundColor: '#3498db', 
    color: 'white' 
  }
};

// Helper functions
export const getStatusColor = (status) => {
  return TASK_STATUS_COLORS[status] || TASK_STATUS_COLORS.default;
};

export const getPriorityStyle = (priority) => {
  return TASK_PRIORITY_STYLES[priority] || TASK_PRIORITY_STYLES.default;
};