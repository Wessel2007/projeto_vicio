import { Ionicons } from '@expo/vector-icons';
import { Tabs, router, type Href } from 'expo-router';
import { useEffect } from 'react';

import { Accent, Colors, Fonts } from '@/constants/theme';
import { carregarDados } from '@/storage';

export default function TabsLayout() {
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
        tabBarActiveTintColor: Accent.brasaTab,
        tabBarInactiveTintColor: Accent.tabInativa,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: Fonts.body.bold, fontSize: 9.5, letterSpacing: 0.5 },
        tabBarIconStyle: { marginTop: 2 },
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
