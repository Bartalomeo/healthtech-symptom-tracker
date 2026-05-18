/**
 * Medical Disclaimer Screen (REQUIRED for App Store)
 * 
 * Every user must accept this disclaimer before using the app.
 * App Store will reject the app if this screen is not implemented.
 */

import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const { height } = Dimensions.get('window')

export default function DisclaimerScreen() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    if (!accepted) return

    // Step 1: Immediately disable button and update UI (sync, commits before navigation)
    setIsLoading(true)

    // Step 2: Fire Firebase ops in background — DONT await, dont block navigation
    // These are fire-and-forget: sign-in and disclaimer sync happen async
    import('../../src/store/useAuthStore').then(({ useAuthStore }) =>
      useAuthStore.getState().signInAnon().catch(err =>
        console.warn('signInAnon error (non-fatal):', err)
      )
    )
    import('../../src/store/useOnboardingStore').then(({ useOnboardingStore }) =>
      useOnboardingStore.getState().acceptDisclaimer().catch(err =>
        console.warn('acceptDisclaimer error (non-fatal):', err)
      )
    )

    // Step 3: Navigate RIGHT NOW — Firebase does NOT block navigation
    // accepted flag is already set in local state, user has already checked the box
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🩺</Text>
          <Text style={styles.title}>Medical Disclaimer</Text>
          <Text style={styles.subtitle}>
            Please read carefully before continuing
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About This App</Text>
            <Text style={styles.sectionText}>
              This application is designed for informational and tracking purposes only. 
              It allows you to log symptoms, track potential triggers, and receive AI-generated 
              pattern analysis based on your inputs.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Important Notice</Text>
            <Text style={styles.sectionText}>
              ⚠️ This app does NOT provide medical advice, diagnosis, or treatment.{'\n\n'}
              The AI-generated insights are based solely on the symptoms you log and are 
              intended for informational purposes only. They should never be used as a 
              substitute for professional medical care.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Responsibility</Text>
            <Text style={styles.sectionText}>
              By using this app, you acknowledge and agree that:{'\n\n'}
              • The app is not a medical device{'n'}
              • You should always consult a qualified healthcare provider{'n'}
              • You should not disregard professional medical advice{'n'}
              • You are responsible for your own health decisions{'n'}
              • The app creators are not liable for any damages arising from use
            </Text>
          </View>

          <View style={styles.cardHighlight}>
            <Text style={styles.highlightTitle}>For Your Safety</Text>
            <Text style={styles.highlightText}>
              If you are experiencing a medical emergency, please call your 
              local emergency services immediately.
            </Text>
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and understood this disclaimer. I acknowledge that this 
            app does not replace a doctor and is for informational purposes only.
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, (!accepted || isLoading) && styles.continueButtonDisabled]}
          onPress={handleAccept}
          disabled={!accepted || isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Please wait...' : 'I Understand & Continue'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to the terms above.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  icon: {
    fontSize: 56,
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  },
  content: {
    marginBottom: 32
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardHighlight: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12
  },
  sectionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8
  },
  highlightText: {
    fontSize: 15,
    color: '#B45309',
    lineHeight: 22
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669'
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22
  },
  continueButton: {
    backgroundColor: '#059669',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF'
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600'
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16
  }
})