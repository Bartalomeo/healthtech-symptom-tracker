/**
 * Root Layout with Anonymous Auth
 * Handles onboarding and authentication flow
 * 
 * IMPORTANT: All Stack.Screen must be rendered unconditionally.
 * Navigation happens via useEffect + router.replace() based on auth state.
 */

import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text, StyleSheet } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { useAuthStore } from '../src/store/useAuthStore'
import { useOnboardingStore } from '../src/store/useOnboardingStore'

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { session, isLoading: authLoading, initialize } = useAuthStore()
  const { disclaimerAccepted, isLoading: onboardingLoading, loadOnboardingStatus } = useOnboardingStore()

  // Initialize auth and onboarding on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initialize()
        await loadOnboardingStatus()
      } catch (e) {
        console.warn('Init error (non-fatal):', e)
      }
    }
    init()
  }, [])

  // Hide splash when auth is ready (not loading)
  useEffect(() => {
    if (!authLoading) {
      SplashScreen.hideAsync()
    }
  }, [authLoading])

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#F9FAFB' }
        }}
      >
        {/* ALL screens must be rendered unconditionally for expo-router to work */}
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="subscription" options={{ animation: 'fade', presentation: 'modal' }} />
      </Stack>
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280'
  }
})