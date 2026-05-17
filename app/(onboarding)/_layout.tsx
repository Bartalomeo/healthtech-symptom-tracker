/**
 * Onboarding Layout
 * Single screen: Medical Disclaimer
 */

import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade'
      }}
    >
      <Stack.Screen name="disclaimer" />
    </Stack>
  )
}