import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="todos" />
      </Stack>
      {/* Redirect any other routes to todos */}
      <Redirect href="/todos" />
    </>
  );
}
