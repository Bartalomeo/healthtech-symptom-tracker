/**
 * Root Layout with Anonymous Auth
 * Handles onboarding and authentication flow
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
  const { session, isLoading: authLoading } = useAuthStore()
  const { disclaimerAccepted, isLoading: onboardingLoading } = useOnboardingStore()

  useEffect(() => {
    if (!authLoading && !onboardingLoading) {
      SplashScreen.hideAsync()
    }
  }, [authLoading, onboardingLoading])

  // Show loading while checking auth
  if (authLoading || onboardingLoading) {
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
        {/* Onboarding flow - medical disclaimer required */}
        {!disclaimerAccepted && (
          <Stack.Screen 
            name="(onboarding)" 
            options={{ animation: 'fade' }} 
          />
        )}

        {/* Auth screens */}
        {!session && disclaimerAccepted && (
          <Stack.Screen 
            name="(auth)" 
            options={{ animation: 'fade' }} 
          />
        )}

        {/* Main tab navigation */}
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