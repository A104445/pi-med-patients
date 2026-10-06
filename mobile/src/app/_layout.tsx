import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ShareIntentProvider } from 'expo-share-intent';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

// O Expo Go não inclui o módulo nativo de partilha; aí os PDFs entram pelo botão "Adicionar PDF".
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function RootNavigator() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    // O ShareIntentProvider tem de ficar no topo para apanhar a partilha
    // mesmo antes de o utilizador iniciar sessão (fica pendente até lá).
    <ShareIntentProvider options={{ resetOnBackground: false, disabled: isExpoGo }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </ShareIntentProvider>
  );
}
