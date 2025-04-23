import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Detail from './screens/Detail';
import Home from './screens/Home';

export default function HomeStack({ route }) {
    const Stack = createStackNavigator();
    const category = route?.params?.category || 'home';

    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ title: category.toUpperCase() }} // Hiển thị tiêu đề dựa trên danh mục
        >
          {(props) => <Home route={{ ...props.route, params: { category } }} />}
        </Stack.Screen>
        <Stack.Screen
          name="Detail"
          component={Detail}
          options={{ title: 'Detail' }} // Tiêu đề cố định cho màn hình Detail
        />
      </Stack.Navigator>
    );
  }
