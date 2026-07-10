import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

import { IntroScreen } from '@/components/intro-screen';
import { Colors } from '@/constants/theme';
import '@/notifications';

const INTRO_DURATION_MS = 2000;

SplashScreen.preventAutoHideAsync();

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.background,
    border: Colors.border,
    text: Colors.text,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      const timer = setTimeout(() => setShowIntro(false), INTRO_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={NavigationDarkTheme}>
      <StatusBar style="light" />
      {showIntro ? (
        <IntroScreen />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="panico"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: '',
              headerShadowVisible: false,
              headerTintColor: Colors.text,
              headerStyle: { backgroundColor: Colors.background },
            }}
          />
        </Stack>
      )}
    </ThemeProvider>
  );
}
