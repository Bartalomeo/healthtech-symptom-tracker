/**
 * Root Layout with Anonymous Auth
 * Handles onboarding and authentication flow
 */

import { useEffect, useState } from 'react'
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
  const [initialized, setInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // Initialize auth and onboarding once on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initialize()
        await loadOnboardingStatus()
      } catch (e) {
        console.warn('Init error (non-fatal):', e)
      } finally {
        setInitialized(true)
      }
    }
    init()
  }, [])

  // Hide splash when both are ready
  useEffect(() => {
    if (initialized && !authLoading && !onboardingLoading) {
      SplashScreen.hideAsync()
    }
  }, [initialized, authLoading, onboardingLoading])

  // Fallback: force hide splash after 10 seconds no matter what
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync()
      setInitialized(true) // ensure we don't stay on loading forever
    }, 10000)
    return () => clearTimeout(t)
  }, [])

  // Show loading screen while checking auth
  if (!initialized || authLoading || onboardingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🩺</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

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
        {/* Landing page for unauthenticated users */}
        {!session && (
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
        )}

        {/* Onboarding flow - required before using the app */}
        {session && !disclaimerAccepted && (
          <Stack.Screen
            name="(onboarding)"
            options={{ animation: 'fade' }}
          />
        )}

        {/* Main tab navigation - only when fully authenticated and onboarded */}
        {session && disclaimerAccepted && (
          <Stack.Screen
            name="(tabs)"
            options={{ animation: 'fade' }}
          />
        )}
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