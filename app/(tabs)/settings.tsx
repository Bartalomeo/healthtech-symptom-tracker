/**
 * Settings Screen - Profile, Subscription, Privacy
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import { auth } from '../../src/lib/firebase'
import { useAuthStore } from '../../src/store/useAuthStore'
import { useSubscriptionStore } from '../../src/store/useSubscriptionStore'
import { TierBadge } from '../../src/components/PremiumGate'

export default function SettingsScreen() {
  const router = useRouter()
  const { session, signOut: handleSignOut } = useAuthStore()
  const { tier, features } = useSubscriptionStore()

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut(auth)
            router.replace('/(auth)/login')
          }
        }
      ]
    )
  }

  const handlePatreon = () => {
    Linking.openURL('https://www.patreon.com/healthtech')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Subscription Card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>Your Subscription</Text>
            <TierBadge tier={tier} />
          </View>
          
          <View style={styles.subscriptionFeatures}>
            <View style={styles.featureRow}>
              <Text style={styles.featureLabel}>Symptom Logging</Text>
              <Text style={[styles.featureValue, features.unlimitedSymptoms && styles.featureValueActive]}>
                {features.unlimitedSymptoms ? 'Unlimited' : '10/month'}
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureLabel}>AI Insights</Text>
              <Text style={[styles.featureValue, features.aiInsights && styles.featureValueActive]}>
                {features.aiInsights ? 'Active' : '🔒 Locked'}
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureLabel}>PDF Export</Text>
              <Text style={[styles.featureValue, features.pdfExport && styles.featureValueActive]}>
                {features.pdfExport ? 'Available' : '🔒 Locked'}
              </Text>
            </View>
          </View>

          {tier === 'none' && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handlePatreon}>
              <Text style={styles.upgradeButtonText}>Upgrade on Patreon</Text>
            </TouchableOpacity>
          )}

          {/*
          ═══════════════════════════════════════════════════════
          DEV MODE TIER SWITCHER — REMOVE BEFORE PRODUCTION
          ═══════════════════════════════════════════════════════
          */}
          <View style={styles.devModeSection}>
            <Text style={styles.devModeTitle}>🔧 Dev Mode</Text>
            <Text style={styles.devModeSubtitle}>Testing only — hide before production</Text>
            <View style={styles.devModeButtons}>
              <TouchableOpacity
                style={[styles.devModeBtn, tier === 'free' && styles.devModeBtnActive]}
                onPress={() => useSubscriptionStore.getState().devSetTier('free')}
              >
                <Text style={[styles.devModeBtnText, tier === 'free' && styles.devModeBtnTextActive]}>Free</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.devModeBtn, tier === 'base' && styles.devModeBtnActive]}
                onPress={() => useSubscriptionStore.getState().devSetTier('base')}
              >
                <Text style={[styles.devModeBtnText, tier === 'base' && styles.devModeBtnTextActive]}>Base</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.devModeBtn, tier === 'premium' && styles.devModeBtnActive]}
                onPress={() => useSubscriptionStore.getState().devSetTier('premium')}
              >
                <Text style={[styles.devModeBtnText, tier === 'premium' && styles.devModeBtnTextActive]}>Premium</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* ═══════════════════════════════════════════════════════ */}
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuLabel}>Anonymous ID</Text>
            <Text style={styles.menuValue}>{session?.uid?.slice(0, 8)}...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Privacy</Text>
          
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>✅</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Disclaimer Accepted</Text>
              <Text style={styles.menuDescription}>Required for app usage</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Personal Data</Text>
              <Text style={styles.menuDescription}>No names, emails, or identifiable info stored</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>About</Text>
          
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>📱</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Version</Text>
              <Text style={styles.menuDescription}>1.0.0 (Build 1)</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>📋</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Medical Disclaimer</Text>
              <Text style={styles.menuDescription}>This app does not replace a doctor</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          AI Symptom Tracker v1.0.0{'\n'}
          Not a medical device. Consult your physician.
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937'
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937'
  },
  subscriptionFeatures: {
    marginBottom: 16
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  featureLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF'
  },
  featureValueActive: {
    color: '#059669'
  },
  upgradeButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  menuSection: {
    marginBottom: 24
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12
  },
  menuContent: {
    flex: 1
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2
  },
  menuDescription: {
    fontSize: 13,
    color: '#9CA3AF'
  },
  menuValue: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18
  },
  // DEV MODE STYLES
  devModeSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B'
  },
  devModeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4
  },
  devModeSubtitle: {
    fontSize: 12,
    color: '#B45309',
    marginBottom: 12
  },
  devModeButtons: {
    flexDirection: 'row',
    gap: 8
  },
  devModeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D97706',
    alignItems: 'center'
  },
  devModeBtnActive: {
    backgroundColor: '#F59E0B'
  },
  devModeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E'
  },
  devModeBtnTextActive: {
    color: '#FFFFFF'
  }
})

import { Platform } from 'react-native'