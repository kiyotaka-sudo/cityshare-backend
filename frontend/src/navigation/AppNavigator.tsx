// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../utils/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import SearchTripsScreen from '../screens/trips/SearchTripsScreen';
import TripDetailScreen from '../screens/trips/TripDetailScreen';
import MyBookingsScreen from '../screens/trips/MyBookingsScreen';
import MyPackagesScreen from '../screens/packages/MyPackagesScreen';
import QRCodeScreen from '../screens/trips/QRCodeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Driver Screens
import CreateTripScreen from '../screens/driver/CreateTripScreen';
import MyTripsScreen from '../screens/driver/MyTripsScreen';
import DriverPackagesScreen from '../screens/driver/DriverPackagesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Auth Stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Bottom Tabs (Passager) ───────────────────────────────────────────────────
function PassengerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, any> = {
            Home:       focused ? 'home'             : 'home-outline',
            Search:     focused ? 'search'           : 'search-outline',
            Bookings:   focused ? 'bookmark'         : 'bookmark-outline',
            Packages:   focused ? 'cube'             : 'cube-outline',
            Profile:    focused ? 'person'           : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}       options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Search"   component={SearchTripsScreen} options={{ tabBarLabel: 'Chercher' }} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen}  options={{ tabBarLabel: 'Réservations' }} />
      <Tab.Screen name="Packages" component={MyPackagesScreen}  options={{ tabBarLabel: 'Colis' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}     options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

// ─── Bottom Tabs (Conducteur) ─────────────────────────────────────────────────
function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, any> = {
            Home:           focused ? 'home'             : 'home-outline',
            MyTrips:        focused ? 'car'              : 'car-outline',
            CreateTrip:     focused ? 'add-circle'       : 'add-circle-outline',
            DriverPackages: focused ? 'cube'             : 'cube-outline',
            Profile:        focused ? 'person'           : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"           component={HomeScreen}           options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="MyTrips"        component={MyTripsScreen}        options={{ tabBarLabel: 'Mes trajets' }} />
      <Tab.Screen name="CreateTrip"     component={CreateTripScreen}     options={{ tabBarLabel: 'Créer' }} />
      <Tab.Screen name="DriverPackages" component={DriverPackagesScreen}  options={{ tabBarLabel: 'Colis' }} />
      <Tab.Screen name="Profile"        component={ProfileScreen}         options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

// ─── Main App Stack ───────────────────────────────────────────────────────────
function MainStack() {
  const { isDriver } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Tabs"
        component={isDriver ? DriverTabs : PassengerTabs}
      />
      <Stack.Screen name="TripDetail"      component={TripDetailScreen} />
      <Stack.Screen name="SearchTrips"     component={SearchTripsScreen} />
      <Stack.Screen name="MyBookings"      component={MyBookingsScreen} />
      <Stack.Screen name="MyPackages"      component={MyPackagesScreen} />
      <Stack.Screen name="QRCode"          component={QRCodeScreen} />
      <Stack.Screen name="CreateTrip"      component={CreateTripScreen} />
      <Stack.Screen name="MyTrips"         component={MyTripsScreen} />
      <Stack.Screen name="DriverPackages"  component={DriverPackagesScreen} />
      <Stack.Screen name="Profile"         component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: 85,
    paddingTop: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
  },
});
