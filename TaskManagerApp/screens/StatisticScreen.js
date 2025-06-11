import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getTaskStatsByCategory, 
  getTaskStatsByStatus, 
  transformCategoryData, 
  transformStatusData 
} from '../service/statisticService';
import { UI_COLORS, CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Lấy kích thước màn hình
const screenWidth = Dimensions.get('window').width;

const StatisticScreen = () => {
  const navigation = useNavigation();
  // 📊 States cho data và UI
  const [rawData, setRawData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔧 Config cho PieChart với design system colors
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  // 🎯 Fetch data khi component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  // 🔄 Refresh data khi screen được focus (user có thể đã login)
  useFocusEffect(
    React.useCallback(() => {
      if (error && error.includes('login')) {
        fetchStatistics(); // Thử lại nếu trước đó lỗi do chưa login
      }
    }, [error])
  );

  /**
   * 📊 Lấy dữ liệu thống kê từ API
   */
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy userId từ AsyncStorage (user đã đăng nhập)
      const userDataString = await AsyncStorage.getItem('user');
      
      if (!userDataString) {
        throw new Error('User not logged in. Please login first.');
      }
      
      const userData = JSON.parse(userDataString);
      const userId = userData.userId;
      
      if (!userId) {
        throw new Error('Invalid user data. Please login again.');
      }
      
      console.log('🔄 Fetching statistics for user:', userId);
      
      // Gọi API - cả 2 function đều gọi cùng 1 endpoint
      const data = await getTaskStatsByCategory(userId);
      
      console.log('📊 Raw data received:', data);
      
      // Lưu raw data (có thể là empty object)
      setRawData(data);
      
      // Transform data cho 2 charts (handle empty data)
      const categoryChartData = data && Object.keys(data).length > 0 
        ? transformCategoryData(data) 
        : [];
      const statusChartData = data && Object.keys(data).length > 0 
        ? transformStatusData(data) 
        : [];
      
      console.log('🎨 Category chart data:', categoryChartData);
      console.log('📈 Status chart data:', statusChartData);
      
      setCategoryData(categoryChartData);
      setStatusData(statusChartData);
      
    } catch (err) {
      console.error('💥 Error fetching statistics:', err);
      const errorMessage = err.message || 'Failed to load statistics';
      setError(errorMessage);
      
      // Nếu lỗi liên quan đến authentication, hiển thị alert khác
      if (errorMessage.includes('login')) {
        Alert.alert(
          'Authentication Required', 
          errorMessage + '\n\nPlease go to Profile tab and login.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to load statistics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎨 Render Loading State
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={UI_COLORS.background} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={UI_COLORS.primary} />
          <Text style={styles.loadingText}>Loading Statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * ❌ Render Error State
   */
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={UI_COLORS.background} />
        <View style={styles.centerContainer}>
          <Ionicons 
            name={error.includes('login') ? "person-outline" : "alert-circle-outline"} 
            size={64} 
            color={UI_COLORS.accent} 
          />
          <Text style={styles.errorText}>{error}</Text>
          {!error.includes('login') && (
            <TouchableOpacity style={styles.retryButton} onPress={fetchStatistics}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  /**
   * 📊 Render Charts
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={UI_COLORS.background} />
      
      {/* Header với gradient */}
      <LinearGradient
        colors={['#7B61FF', '#9C88FF']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Ionicons name="analytics-outline" size={32} color="white" />
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSubtitle}>Track your progress</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart-outline" size={24} color={UI_COLORS.primary} />
            <Text style={styles.chartTitle}>Tasks by Category</Text>
          </View>
          {categoryData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <PieChart
                data={categoryData}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={true}
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="folder-open-outline" size={48} color={UI_COLORS.text.light} />
              <Text style={styles.noDataText}>No category data available</Text>
            </View>
          )}
        </View>

        {/* Status Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="stats-chart-outline" size={24} color={UI_COLORS.primary} />
            <Text style={styles.chartTitle}>Tasks by Status</Text>
          </View>
          {statusData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <PieChart
                data={statusData}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={true}
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color={UI_COLORS.text.light} />
              <Text style={styles.noDataText}>No status data available</Text>
            </View>
          )}
        </View>

        {/* Summary Cards */}
        {rawData && Object.keys(rawData).length > 0 && (
          <View style={styles.summaryGrid}>
            <LinearGradient
              colors={CATEGORY_COLORS[0]}
              style={styles.summaryCard}
            >
              <Ionicons name="apps-outline" size={32} color="white" />
              <Text style={styles.summaryNumber}>
                {Object.keys(rawData).length}
              </Text>
              <Text style={styles.summaryLabel}>Categories</Text>
            </LinearGradient>

            <LinearGradient
              colors={CATEGORY_COLORS[1]}
              style={styles.summaryCard}
            >
              <Ionicons name="list-outline" size={32} color="white" />
              <Text style={styles.summaryNumber}>
                {Object.values(rawData).reduce((total, category) => 
                  total + (category.pending || 0) + (category.done || 0) + (category.in_progress || 0), 0
                )}
              </Text>
              <Text style={styles.summaryLabel}>Total Tasks</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120, // Đủ space cho tab bar + extra padding
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_COLORS.background,
    padding: 20,
  },
  
  // Header Styles
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },

  // Chart Card Styles
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: UI_COLORS.text.primary,
    marginLeft: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },

  // No Data Styles
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    textAlign: 'center',
    color: UI_COLORS.text.light,
    fontSize: 16,
    marginTop: 12,
  },

  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Loading & Error States
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: UI_COLORS.text.secondary,
  },
  errorText: {
    fontSize: 18,
    color: UI_COLORS.accent,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },



  bottomSpacing: {
    height: 40,
  },
});

export default StatisticScreen;