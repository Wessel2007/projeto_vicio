import { Ionicons } from '@expo/vector-icons';
import { Tabs, router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { carregarDados } from '@/storage';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colorScheme = scheme === 'dark' ? 'dark' : 'light';
  const cores = Colors[colorScheme];

  useEffect(() => {
    carregarDados().then((dados) => {
      if (!dados.onboardingDone) {
        router.replace('/onboarding' as Href);
      }
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3C87F7',
        tabBarInactiveTintColor: cores.textSecondary,
        tabBarStyle: { backgroundColor: cores.background },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Diário',
          tabBarIcon: ({ color, size }) => <Ionicons name="journal-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="conquistas"
        options={{
          title: 'Patente',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
