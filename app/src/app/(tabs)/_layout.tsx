import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Meu Dia',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar" size={22} color={color} />
          ),
          headerTitle: 'Meu Dia',
        }}
      />
      <Tabs.Screen
        name="navigator"
        options={{
          title: 'Campus',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="map-marker" size={22} color={color} />
          ),
          headerTitle: 'Navegador do Campus',
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="heart" size={22} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="comunica"
        options={{
          title: 'Comunica',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="envelope" size={22} color={color} />
          ),
          headerTitle: 'Comunica Fácil',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={22} color={color} />
          ),
          headerTitle: 'Perfil e Configurações',
        }}
      />
    </Tabs>
  );
}
