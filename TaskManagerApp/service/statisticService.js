import { getRequest } from '../config/apiCaller';
import { apiPath } from '../config/apiPath';
import { CATEGORY_COLORS, TASK_STATUS_COLORS } from '../constants';

/**
 * 📊 STATISTIC SERVICE
 * Chứa các function để lấy dữ liệu thống kê từ backend
 */

/**
 * 🎯 Lấy thống kê tasks theo Category
 * @param {number} userId - ID của user
 * @returns {Promise} - Promise chứa data thống kê
 */
export const getTaskStatsByCategory = async (userId) => {
  try {
    console.log('📊 Fetching category stats for user:', userId);
    
    console.log('🌐 Calling backend API...');
    const response = await getRequest(
      apiPath.getTaskStatsByCategory,
      { userId }
    );
    
    console.log('🔍 Backend response:', response);
    
    // Validate response structure
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format from backend');
    }
    
    // If empty response, return empty object (will be handled by UI)
    if (Object.keys(response).length === 0) {
      console.log('� Backend returned empty data');
      return {};
    }
    
    console.log('✅ Using backend data:', response);
    return response;
    
  } catch (error) {
    console.error('💥 Service error - getTaskStatsByCategory:', error);
    throw error;
  }
};

/**
 * 📈 Lấy thống kê tasks theo Status (sử dụng cùng data với Category)
 * @param {number} userId - ID của user
 * @returns {Promise} - Promise chứa data thống kê
 */
export const getTaskStatsByStatus = async (userId) => {
  try {
    console.log('📈 Fetching status stats for user:', userId);
    
    // Sử dụng cùng function với Category vì backend trả về cùng data
    return await getTaskStatsByCategory(userId);
    
  } catch (error) {
    console.error('💥 Service error - getTaskStatsByStatus:', error);
    throw error;
  }
};

/**
 * 🔄 Transform data từ backend thành format cho PieChart
 * Backend trả về: { "Work": {"pending": 5, "done": 3}, "Personal": {...} }
 * PieChart cần: [{ name: "Work", population: 8, color: "#FF6384" }, ...]
 */

/**
 * 🎨 Chuyển đổi data category cho PieChart
 * @param {Object} backendData - Data từ backend
 * @returns {Array} - Array format cho PieChart
 */
export const transformCategoryData = (backendData) => {
  if (!backendData || Object.keys(backendData).length === 0) {
    return [];
  }
  
  return Object.keys(backendData).map((categoryName, index) => {
    const categoryStats = backendData[categoryName];
    // Tính tổng tasks trong category này
    const total = (categoryStats.pending || 0) + (categoryStats.done || 0) + (categoryStats.in_progress || 0);
    
    // Sử dụng màu gradient đầu tiên từ CATEGORY_COLORS (giống My Day screen)
    const colorGradient = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    
    return {
      name: categoryName,
      population: total,
      color: colorGradient[0], // Lấy màu đầu tiên của gradient
      legendFontColor: '#333',
      legendFontSize: 14
    };
  }).filter(item => item.population > 0); // Chỉ hiển thị categories có tasks
};

/**
 * 📊 Chuyển đổi data status cho PieChart
 * @param {Object} backendData - Data từ backend
 * @returns {Array} - Array format cho PieChart
 */
export const transformStatusData = (backendData) => {
  if (!backendData || Object.keys(backendData).length === 0) {
    return [];
  }
  
  // Sử dụng màu sắc từ taskConstants (giống với các task items)
  const statusColors = {
    pending: TASK_STATUS_COLORS.pending,       // Gray
    in_progress: TASK_STATUS_COLORS.in_progress, // Orange  
    done: TASK_STATUS_COLORS.done              // Green
  };
  
  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    done: 'Completed'
  };
  
  // Tính tổng cho mỗi status từ tất cả categories
  const statusTotals = { pending: 0, in_progress: 0, done: 0 };
  
  Object.values(backendData).forEach(categoryStats => {
    statusTotals.pending += categoryStats.pending || 0;
    statusTotals.in_progress += categoryStats.in_progress || 0;
    statusTotals.done += categoryStats.done || 0;
  });
  
  // Chuyển thành format cho PieChart
  return Object.keys(statusTotals)
    .filter(status => statusTotals[status] > 0) // Chỉ hiển thị status có data
    .map(status => ({
      name: statusLabels[status],
      population: statusTotals[status],
      color: statusColors[status],
      legendFontColor: '#333',
      legendFontSize: 14
    }));
};