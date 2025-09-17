import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="cbt/index" />
      <Stack.Screen name="mindfulness/index" />
      <Stack.Screen name="pomodoro/index" />
      <Stack.Screen name="five-minute/index" />
      <Stack.Screen name="activity/index" />
      <Stack.Screen name="analytics/index" />
      <Stack.Screen name="intentions/index" />
      <Stack.Screen name="sleep/index" />
      <Stack.Screen name="self-compassion/index" />
      <Stack.Screen name="social/index" />
      <Stack.Screen name="environmental/index" />
      <Stack.Screen name="gamification/index" />
      <Stack.Screen name="integrations/index" />
      <Stack.Screen name="research/index" />
    </Stack>
  );
}