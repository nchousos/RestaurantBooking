import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderBackButton } from '@react-navigation/elements';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import RestaurantDetails from '../screens/RestaurantDetails';
import ProfileScreen from '../screens/ProfileScreen';
import EditReservationScreen from '../screens/EditReservationScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      {/* Show title only, no back arrow */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Σύνδεση', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={({ navigation }) => ({
          title: 'Εγγραφή',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => navigation.navigate('Login')}
              
            />
          ),
        })}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Εστιατόρια', headerBackVisible: false }}
      />

      {/* Custom back behavior with title */}
      <Stack.Screen
        name="RestaurantDetails"
        component={RestaurantDetails}
        options={({ navigation }) => ({
          title: 'Λεπτομέρειες Εστιατορίου',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => navigation.navigate('Home')}
              
            />
          ),
        })}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Το Προφίλ μου',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => navigation.navigate('Home')}
              
            />
          ),
        })}
      />
      <Stack.Screen
        name="EditReservation"
        component={EditReservationScreen}
        options={({ navigation }) => ({
          title: 'Επεξεργασία Κράτησης',
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => navigation.navigate('Profile')}
              
            />
          ),
        })}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;