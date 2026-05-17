/**
 * Dashboard Screen - Beautiful Home Screen with Stats and Recent Symptoms
 */

import { useState, useEffect } from 'react'
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  Dimensions, RefreshControl 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../src/lib/firebase'
import { useAuthStore } from '../../src/store/useAuthStore'
import { useSubscriptionStore } from '../../src/store/useSubscriptionStore'

const { width } = Dimensions.get('window')

// Mock data for demo
const MOCK_RECENT_SYMPTOMS = [
  { id: '1', name: 'Headache', severity: 7, loggedAt: new Date(Date.now() - 1000 * 60 * 30), triggers: ['sleep', 'stress'] },
  { id: '2', name: 'Fatigue', severity: 5, loggedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), triggers: ['sleep'] },
  { id: '3', name: 'Stomach', severity: 3, loggedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), triggers: ['food'] }
]

export default function DashboardScreen() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { tier, features, loadSubscription } = useSubscriptionStore()
  
  const [recentSymptoms, setRecentSymptoms] = useState(MOCK_RECENT_SYMPTOMS)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSubscription()
    loadRecentSymptoms()
  }, [])

  const loadRecentSymptoms = async () => {
    // TODO: Load from Firestore
    setRecentSymptoms(MOCK_RECENT_SYMPTOMS)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadRecentSymptoms()
    setRefreshing(false)
  }

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return '#10B981'
    if (severity <= 6) return '#FBBF24'
    return '#F97316'
  }

  const getTriggerIcon = (trigger: string) => {
    const icons: Record<string, string> = {
      sleep: '😴', stress: '😤', food: '🍔', weather: '🌧️',
      exercise: '🏃', medication: '💊'
    }
    return icons[trigger] || '📌'
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.subGreeting}>How are you feeling today?</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Badge */}
        {tier !== 'none' && (
          <View style={[styles.subscriptionBadge, tier === 'premium' && styles.subscriptionBadgePremium]}>
            <Text style={styles.subscriptionBadgeText}>
              {tier === 'base' ? '🌟 Base Member' : '💎 Premium Member'}
            </Text>
          </View>
        )}

        {/* Quick Action Card */}
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/log')}
          activeOpacity={0.9}
        >
          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionIcon}>📝</Text>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Log a Symptom</Text>
              <Text style={styles.quickActionSubtitle}>Track how you're feeling now</Text>
            </View>
          </View>
          <View style={styles.quickActionArrow}>
            <Text style={styles.quickActionArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{recentSymptoms.length}</Text>
            <Text style={styles.statLabel}>Logged This Week</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🧠</Text>
            <Text style={styles.statValue}>{tier !== 'none' ? 'Active' : '🔒'}</Text>
            <Text style={styles.statLabel}>AI Insights</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Recent Symptoms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Symptoms</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentSymptoms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>No symptoms logged yet</Text>
              <Text style={styles.emptyText}>Start tracking to get AI insights</Text>
            </View>
          ) : (
            <View style={styles.symptomsList}>
              {recentSymptoms.map((symptom) => (
                <View key={symptom.id} style={styles.symptomCard}>
                  <View style={styles.symptomHeader}>
                    <View style={styles.symptomInfo}>
                      <Text style={styles.symptomName}>{symptom.name}</Text>
                      <Text style={styles.symptomTime}>{formatTime(symptom.loggedAt)}</Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(symptom.severity) }]}>
                      <Text style={styles.severityText}>{symptom.severity}/10</Text>
                    </View>
                  </View>
                  
                  {symptom.triggers.length > 0 && (
                    <View style={styles.triggersRow}>
                      {symptom.triggers.map((trigger) => (
                        <View key={trigger} style={styles.triggerBadge}>
                          <Text style={styles.triggerBadgeIcon}>{getTriggerIcon(trigger)}</Text>
                          <Text style={styles.triggerBadgeText}>{trigger}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* AI Insights Prompt */}
        {tier !== 'none' ? (
          <TouchableOpacity 
            style={styles.insightsPrompt}
            onPress={() => router.push('/(tabs)/insights')}
            activeOpacity={0.8}
          >
            <View style={styles.insightsPromptIcon}>
              <Text style={styles.insightsPromptEmoji}>🧠</Text>
            </View>
            <View style={styles.insightsPromptContent}>
              <Text style={styles.insightsPromptTitle}>View AI Insights</Text>
              <Text style={styles.insightsPromptText}>
                {tier === 'premium' 
                  ? 'Export insights as PDF for your doctor'
                  : 'Discover patterns in your symptom data'}
              </Text>
            </View>
            <Text style={styles.insightsArrow}>→</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.upgradePrompt}>
            <Text style={styles.upgradePromptTitle}>Unlock AI Insights</Text>
            <Text style={styles.upgradePromptText}>
              Upgrade to Base ($3/mo) or Premium ($5/mo) to see pattern analysis
            </Text>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Safety Reminder */}
        <View style={styles.safetyReminder}>
          <Text style={styles.safetyIcon}>⚠️</Text>
          <Text style={styles.safetyText}>
            Remember: This app does not replace medical advice. 
            Always consult your physician for health concerns.
          </Text>
        </View>
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
    paddingBottom: 100
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937'
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  profileIcon: {
    fontSize: 24
  },
  subscriptionBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  subscriptionBadgePremium: {
    backgroundColor: '#EDE9FE'
  },
  subscriptionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46'
  },
  quickActionCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  quickActionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  quickActionIcon: {
    fontSize: 36,
    marginRight: 16
  },
  quickActionText: {
    flex: 1
  },
  quickActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  quickActionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickActionArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937'
  },
  sectionLink: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500'
  },
  symptomsList: {},
  symptomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  symptomInfo: {
    flex: 1
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  symptomTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  triggersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4
  },
  triggerBadgeIcon: {
    fontSize: 12,
    marginRight: 4
  },
  triggerBadgeText: {
    fontSize: 12,
    color: '#6B7280'
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center'
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280'
  },
  insightsPrompt: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  insightsPromptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  insightsPromptEmoji: {
    fontSize: 24
  },
  insightsPromptContent: {
    flex: 1
  },
  insightsPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  insightsPromptText: {
    fontSize: 13,
    color: '#6B7280'
  },
  insightsArrow: {
    fontSize: 20,
    color: '#7C3AED',
    fontWeight: '600'
  },
  upgradePrompt: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16
  },
  upgradePromptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8
  },
  upgradePromptText: {
    fontSize: 14,
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 16
  },
  upgradeButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  safetyReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginTop: 8
  },
  safetyIcon: {
    fontSize: 20,
    marginRight: 10
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18
  }
})