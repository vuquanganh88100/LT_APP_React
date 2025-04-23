// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './screens/Welcome';
import Home from './screens/Home';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Detail from './screens/Detail';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerScreens() {
  return (
    <Drawer.Navigator initialRouteName='Start'>
      <Drawer.Screen name='Start' component={Welcome} options={{drawerLabel:'🚀 Start'}}/>
      <Drawer.Screen name='Home' options={{drawerLabel:'🏠 Home'}} component={Home} initialParams={{category:'home'}}/>
      <Drawer.Screen name="Sport" options={{drawerLabel:'⚽  Sport'}} component={Home} initialParams={{category:'sport'}}/>
      <Drawer.Screen name="Business" options={{drawerLabel:'💼 Business'}} component={Home} initialParams={{category: 'business'}}/>
      <Drawer.Screen name="Entertainment" options={{drawerLabel:'🎬 Entertainment'}} component={Home} initialParams={{category:'entertainment'}}/>
      <Drawer.Screen name="Technology" options={{drawerLabel:'💻 Technology'}} component={Home} initialParams={{category:'technology'}}/>
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="DrawerScreens" component={DrawerScreens} />
        <Stack.Screen name="Detail" component={Detail} options={{headerShown: true}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}