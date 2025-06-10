import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryService } from '../service/categoryService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import ModalCategory from '../components/ModalCategory';
import { ITEM_WIDTH, CATEGORY_ICONS, CATEGORY_COLORS, DATE_FORMATS, UI_COLORS } from '../constants';

const MyDayScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  // Memoize gradients for categories to avoid recalculation
  const getColorGradient = useCallback((index) => {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  }, []);

  // Get an appropriate icon for the category
  const getCategoryIcon = useCallback((categoryName) => {
    const normalizedName = categoryName?.toLowerCase() || '';

    for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
      if (normalizedName.includes(key.toLowerCase())) {
        return value;
      }
    }
    return CATEGORY_ICONS.Other;
  }, []);

  // Fetch categories data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userDataString = await AsyncStorage.getItem('user');
      if (!userDataString) {
        console.warn("User not logged in");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userDataString);
      setUserId(user.userId);

      categoryService.getCategories(
        user.userId,
        (data) => {
          const categoriesWithStyles = data.map((cat, index) => ({
            ...cat,
            colorGradient: getColorGradient(index),
            icon: getCategoryIcon(cat.name),
          }));
          setCategories(categoriesWithStyles);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching categories:", error);
          setError("Failed to load categories");
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error retrieving user data:", error);
      setError("Error loading user data");
      setLoading(false);
    }
  }, [getColorGradient, getCategoryIcon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Calculate total tasks for a category
  const getTotalTasks = useCallback((category) => {
    return (category.pendingCount || 0) +
      (category.inprogressCount || 0) +
      (category.doneCount || 0);
  }, []);

  const handleCategoryPress = useCallback((category) => {
    console.log('Category pressed:', category.name);
  }, []);
  // Render the category item with improved UI
  const renderCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.colorGradient}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.categoryHeader}>
          <Ionicons name={item.icon} size={24} color="white" />
          <View style={styles.totalTaskBadge}>
            <Text style={styles.totalTaskCount}>{getTotalTasks(item)}</Text>
          </View>
        </View>

        <Text style={styles.categoryName}>{item.name}</Text>

        <View style={styles.taskStatsContainer}>
          {item.pendingCount > 0 && (
            <View style={styles.taskStat}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.taskCount}>{item.pendingCount} pending</Text>
            </View>
          )}

          {item.inprogressCount > 0 && (
            <View style={styles.taskStat}>
              <Ionicons name="hourglass-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.taskCount}>{item.inprogressCount} in progress</Text>
            </View>
          )}

          {item.doneCount > 0 && (
            <View style={styles.taskStat}>
              <Ionicons name="checkmark-circle-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.taskCount}>{item.doneCount} completed</Text>
            </View>
          )}

          {getTotalTasks(item) === 0 && (
            <View style={styles.taskStat}>
              <Text style={styles.taskCount}>No tasks yet</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [getTotalTasks, handleCategoryPress]);

  const handleAddCategory = useCallback(() => {
    console.log('Add new category pressed');
    setModalVisible(true);
  }, []);

  const renderAddCategoryButton = useCallback(() => (
    <TouchableOpacity
      style={styles.addCategoryButton}
      onPress={handleAddCategory}
      activeOpacity={0.7}
    >
      <View style={styles.addButtonContent}>
        <View style={styles.addIconContainer}>
          <Ionicons name="add" size={30} color="#7B61FF" />
        </View>
        <Text style={styles.addCategoryText}>Add New Category</Text>
        <Text style={styles.addCategorySubtext}>Organize your tasks</Text>
      </View>
    </TouchableOpacity>
  ), []);




  const handleCategoryAdded = useCallback((newCategory) => {
    console.log('New category added:', newCategory);
    const styledCategory = {
      ...newCategory,
      colorGradient: getColorGradient(categories.length),
      icon: getCategoryIcon(newCategory.name),
    };
    // Update categories with the new one
    setCategories([...categories, styledCategory]);
  }, [categories, getColorGradient, getCategoryIcon]);

  const renderItems = useCallback(({ item }) => {
    if (item === 'add') {
      return renderAddCategoryButton();
    }
    return renderCategoryItem({ item });
  }, [renderCategoryItem, renderAddCategoryButton]);

  const dataSource = useMemo(() => [...categories, 'add'], [categories]);

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="folder-open-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyStateText}>No categories yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Create categories to organize your tasks
        </Text>
      </View>
    );
  };

  // Format the date in a more readable way
  const formattedDate = useMemo(() => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={18} color="#7B61FF" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Lists</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#7B61FF" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={dataSource}
            renderItem={renderItems}
            keyExtractor={(item, index) => {
              if (typeof item === 'string') return `add-${index}`;
              return item?.id != null ? `category-${item.id}` : `category-fallback-${index}`;
            }}

            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={categories.length === 0 ? styles.emptyListContent : styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#7B61FF']}
                tintColor="#7B61FF"
              />
            }
          />
        )}
      </View>

      <ModalCategory
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddCategory={handleCategoryAdded}
        userId={userId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginTop: 50,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTaskBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalTaskCount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
  taskStatsContainer: {
    marginTop: 5,
  },
  taskStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  taskCount: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 5,
  },
  addCategoryButton: {
    width: ITEM_WIDTH,
    height: 160,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#7B61FF',
    borderStyle: 'dashed',
    overflow: 'hidden',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addCategoryText: {
    fontSize: 16,
    color: '#7B61FF',
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },
  addCategorySubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7B61FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
});

export default MyDayScreen;