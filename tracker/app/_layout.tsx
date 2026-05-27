import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDB } from '@/lib/database';

export default function RootLayout() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]" options={{ title: 'Detail měření', headerBackTitle: 'Zpět'}} />
    </Stack>
  );
}