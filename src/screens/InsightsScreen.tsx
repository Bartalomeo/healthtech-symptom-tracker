/**
 * Insights Screen - AI Pattern Analysis
 * 
 * Displays AI-powered insights based on user's symptom history.
 * Requires Base or Premium subscription.
 */

import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AIAccessGate } from '@/components/PremiumGate'
import { InsightList, AIInsightData, InsightPDFExport } from '@/components/InsightCard'
import { useSubscriptionStore } from '@/store/useSubscriptionStore'

// ============================================================
// MOCK DATA (Replace with Firebase/Supabase calls)
// ============================================================

const MOCK_INSIGHTS: AIInsightData[] = [
  {
    id: '1',
    text: '📊 [85%] correlation: Your headaches occur 3x more frequently on workdays with less than 6 hours of sleep. This is an AI analysis, not medical advice. Please consult your physician.',
    triggerType: 'sleep',
    confidence: 0.85,
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    symptomsAnalyzed: 14
  },
  {
    id: '2',
    text: '🌧️ [72%] correlation: Fatigue symptoms are 2.5x worse on days following rainfall and humidity above 70%. This is an AI analysis, not medical advice. Please consult your physician.',
    triggerType: 'weather',
    confidence: 0.72,
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    symptomsAnalyzed: 21
  },
  {
    id: '3',
    text: '🍽️ [58%] correlation: You report stomach discomfort 80% of days after consuming dairy products (milk, cheese, yogurt). This is an AI analysis, not medical advice. Please consult your physician.',
    triggerType: 'food',
    confidence: 0.58,
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    symptomsAnalyzed: 9
  }
]

// ============================================================
// TYPES
// ============================================================

interface InsightsScreenProps {
  route?: any
}

interface GenerateInsightsResult {
  success: boolean
  insight?: AIInsightData
  error?: string
}

// ============================================================
// INSIGHTS SCREEN COMPONENT
// ============================================================

const InsightsScreenContent: React.FC = () => {
  const [insights, setInsights] = useState<AIInsightData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)

  const { loadSubscription, tier } = useSubscriptionStore()

  // Load insights on mount
  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    setIsLoading(true)
    
    try {
      // TODO: Replace with actual Firebase/Supabase query
      // const { data } = await supabase
      //   .from('insights')
      //   .select('*')
      //   .order('generatedAt', { ascending: false })
      //   .limit(10)
      
      // Mock: simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      setInsights(MOCK_INSIGHTS)
      setLastAnalysis(new Date())
    } catch (error) {
      console.error('Failed to load insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateNewInsights = async (): Promise<GenerateInsightsResult> => {
    setIsGenerating(true)

    try {
      // TODO: Replace with actual Firebase Cloud Function call
      // const result = await functions.httpsCallable('analyzePatterns')()
      
      // Mock: simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newInsight: AIInsightData = {
        id: `insight_${Date.now()}`,
        text: `📊 [${Math.floor(Math.random() * 30 + 60)}%] correlation: Based on your recent symptom logs, we\'ve identified a pattern that your symptoms correlate with sleep duration and stress levels. This is an AI analysis, not medical advice. Please consult your physician.`,
        triggerType: ['sleep', 'weather', 'food', 'stress'][Math.floor(Math.random() * 4)] as any,
        confidence: Math.random() * 0.3 + 0.6,
        generatedAt: new Date().toISOString(),
        symptomsAnalyzed: Math.floor(Math.random() * 20 + 5)
      }

      setInsights(prev => [newInsight, ...prev])
      setLastAnalysis(new Date())
      
      return { success: true, insight: newInsight }
    } catch (error) {
      console.error('Failed to generate insights:', error)
      return { success: false, error: 'Failed to generate insights. Please try again.' }
    } finally {
      setIsGenerating(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadInsights()
    setRefreshing(false)
  }, [])

  const handleExportPDF = async (insight: AIInsightData) => {
    // TODO: Implement actual PDF generation
    // For now, use Share API
    const { Share } = require('react-native')
    
    const content = `
AI HEALTH INSIGHT REPORT
═══════════════════════════════

Trigger Type: ${insight.triggerType.toUpperCase()}
Confidence: ${Math.round(insight.confidence * 100)}%
Based on: ${insight.symptomsAnalyzed} symptoms
Generated: ${new Date(insight.generatedAt).toLocaleString()}

═══════════════════════════════

ANALYSIS:
${insight.text}

═══════════════════════════════

⚠️ MEDICAL DISCLAIMER:
This is an AI analysis, not medical advice. 
Please consult your physician.

═══════════════════════════════
    `.trim()

    await Share.share({
      message: content,
      title: 'AI Health Insight Report'
    })
  }

  const handleGenerateInsights = async () => {
    const result = await generateNewInsights()
    if (!result.success && result.error) {
      Alert.alert('Error', result.error)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Insights</Text>
          <Text style={styles.subtitle}>
            {tier === 'premium' ? 'Premium Analysis' : tier === 'base' ? 'Base Analysis' : 'Upgrade for AI'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.refreshButton, isGenerating && styles.refreshButtonDisabled]}
          onPress={handleGenerateInsights}
          disabled={isGenerating}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshIcon}>{isGenerating ? '⏳' : '🔄'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tier Info Banner */}
      {tier === 'none' && (
        <View style={styles.upgradeBanner}>
          <Text style={styles.upgradeBannerText}>
            💡 Upgrade to Base ($3/mo) or Premium ($5/mo) for AI-powered pattern analysis
          </Text>
        </View>
      )}

      {/* Stats Row */}
      {insights.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{insights.length}</Text>
            <Text style={styles.statLabel}>Insights</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {lastAnalysis ? Math.round((Date.now() - lastAnalysis.getTime()) / 60000) : 0}m
            </Text>
            <Text style={styles.statLabel}>Last Update</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.max(...insights.map(i => Math.round(i.confidence * 100)))}%
            </Text>
            <Text style={styles.statLabel}>Top Confidence</Text>
          </View>
        </View>
      )}

      {/* Insights List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <InsightList
          insights={insights}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onExportPDF={handleExportPDF}
        />
      </ScrollView>

      {/* Generate Button (Fixed Bottom) */}
      {tier !== 'none' && (
        <View style={styles.generateButtonContainer}>
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerateInsights}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            <Text style={styles.generateButtonIcon}>🧠</Text>
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Analyzing...' : 'Generate New Insights'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

// ============================================================
// WRAPPED SCREEN WITH PREMIUM GATE
// ============================================================

export default function InsightsScreen() {
  return (
    <AIAccessGate
      fallback={
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedEmoji}>🔒</Text>
            <Text style={styles.lockedTitle}>AI Insights Locked</Text>
            <Text style={styles.lockedText}>
              Upgrade to Base ($3/mo) or Premium ($5/mo) to unlock AI-powered pattern analysis of your symptoms.
            </Text>
            
            <View style={styles.tierComparison}>
              <View style={styles.tierCard}>
                <Text style={styles.tierCardName}>Base</Text>
                <Text style={styles.tierCardPrice}>$3/mo</Text>
                <Text style={styles.tierCardFeatures}>✓ AI Insights</Text>
              </View>
              <View style={[styles.tierCard, styles.tierCardHighlighted]}>
                <Text style={styles.tierCardName}>Premium</Text>
                <Text style={styles.tierCardPrice}>$5/mo</Text>
                <Text style={styles.tierCardFeatures}>✓ AI Insights{'\n'}✓ PDF Export</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.patreonButton}
              activeOpacity={0.8}
              onPress={() => {
                const { Linking } = require('react-native')
                Linking.openURL('https://www.patreon.com/healthtech')
              }}
            >
              <Text style={styles.patreonButtonText}>Subscribe on Patreon</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      }
    >
      <InsightsScreenContent />
    </AIAccessGate>
  )
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  refreshButtonDisabled: {
    opacity: 0.6
  },
  refreshIcon: {
    fontSize: 20
  },
  upgradeBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  upgradeBannerText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500'
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937'
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100
  },
  generateButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  generateButtonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  generateButtonIcon: {
    fontSize: 20,
    marginRight: 10
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60
  },
  lockedEmoji: {
    fontSize: 64,
    marginBottom: 24
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  lockedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  tierComparison: {
    flexDirection: 'row',
    marginBottom: 24
  },
  tierCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  tierCardHighlighted: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAFAFA'
  },
  tierCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  tierCardPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 12
  },
  tierCardFeatures: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18
  },
  patreonButton: {
    backgroundColor: '#FF424D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12
  },
  patreonButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
})

// ============================================================
// USAGE
// ============================================================

/*
// In your app router:
import InsightsScreen from './insights'

// In tabs layout:
<Tabs.Screen 
  name="insights" 
  component={InsightsScreen}
  options={{ title: 'Insights', tabIcon: '🧠' }}
/>

// The screen automatically:
1. Checks if user has 'aiInsights' feature via PremiumGate
2. Shows locked screen if tier = 'none'
3. Displays AI insights if user has Base or Premium
4. Allows generating new insights (Cloud Function call)
5. Shows PDF export button for Premium users only
*/