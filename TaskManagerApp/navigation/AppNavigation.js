import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import MyDayScreen from '../screens/MyDayScreen';
import AllTaskScreen from '../screens/AllTaskScreen';
import CalendarScreen from '../screens/CalendarScreen';
import StatisticScreen from '../screens/StatisticScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const myDay = "My Day";
const allTasks = "All Tasks";
const calendar = "Calendar";
const profile = "Profile";
const statistic = "Statistic";

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === myDay) {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === allTasks) {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === calendar) {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === statistic) {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === profile) {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        })}
      >
        <Tab.Screen name={myDay} component={MyDayScreen} />
        <Tab.Screen name={allTasks} component={AllTaskScreen} />
        <Tab.Screen name={calendar} component={CalendarScreen} />
        <Tab.Screen name={statistic} component={StatisticScreen} />
        <Tab.Screen name={profile} component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
