export * from './categoryConstants';
export * from './uiConstants';
export * from './dateConstants';

// Explicitly export each item from taskConstants for cleaner imports
import { 
  TASK_STATUS_COLORS, 
  TASK_PRIORITY_STYLES, 
  getStatusColor, 
  getPriorityStyle 
} from './taskConstants';

export {
  TASK_STATUS_COLORS,
  TASK_PRIORITY_STYLES,
  getStatusColor,
  getPriorityStyle
};