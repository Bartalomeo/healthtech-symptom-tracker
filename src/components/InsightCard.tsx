/**
 * AI Insight Card Component
 * 
 * Displays AI pattern analysis in a beautiful card format.
 * Includes PDF export button for premium users.
 */

import { View, Text, TouchableOpacity, StyleSheet, Alert, Share, Platform } from 'react-native'
import * as Linking from 'expo-linking'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { TierBadge } from './PremiumGate'

// ============================================================
// TYPES
// ============================================================

export interface AIInsightData {
  id: string
  text: string
  triggerType: 'food' | 'weather' | 'sleep' | 'stress' | 'general'
  confidence: number
  generatedAt: string
  symptomsAnalyzed: number
}

interface InsightCardProps {
  insight: AIInsightData
  onExportPDF?: () => Promise<void>
}

interface InsightListProps {
  insights: AIInsightData[]
  isLoading?: boolean
  onRefresh?: () => void
  onExportPDF?: (insight: AIInsightData) => Promise<void>
}

// ============================================================
// CONSTANTS
// ============================================================

const TRIGGER_ICONS: Record<string, string> = {
  food: '🍽️',
  weather: '🌧️',
  sleep: '😴',
  stress: '💆',
  general: '📊'
}

const TRIGGER_COLORS: Record<string, { bg: string; text: string }> = {
  food: { bg: '#FEF3C7', text: '#D97706' },
  weather: { bg: '#DBEAFE', text: '#2563EB' },
  sleep: { bg: '#E0E7FF', text: '#4F46E5' },
  stress: { bg: '#FCE7F3', text: '#DB2777' },
  general: { bg: '#D1FAE5', text: '#059669' }
}

// ============================================================
// SINGLE INSIGHT CARD
// ============================================================

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onExportPDF }) => {
  const { features, tier } = useSubscriptionStore()
  const canExport = features.pdfExport

  const icon = TRIGGER_ICONS[insight.triggerType] || '📊'
  const colors = TRIGGER_COLORS[insight.triggerType] || TRIGGER_COLORS.general

  const handleShare = async () => {
    try {
      await Share.share({
        message: insight.text,
        title: 'AI Health Insight'
      })
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const handleExportPDF = async () => {
    if (!canExport) {
      Alert.alert(
        'Premium Feature',
        'PDF Export is available with Premium subscription ($5/mo)',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => Linking.openURL('https://www.patreon.com/healthtech') }
        ]
      )
      return
    }

    if (onExportPDF) {
      try {
        await onExportPDF()
        Alert.alert('Success', 'PDF exported successfully!')
      } catch (error) {
        Alert.alert('Error', 'Failed to export PDF. Please try again.')
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const confidencePercent = Math.round(insight.confidence * 100)

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.triggerBadge, { backgroundColor: colors.bg }]}>
          <Text style={styles.triggerIcon}>{icon}</Text>
          <Text style={[styles.triggerLabel, { color: colors.text }]}>
            {insight.triggerType.toUpperCase()}
          </Text>
        </View>
        <TierBadge tier={tier} />
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.insightText}>{insight.text}</Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{confidencePercent}% confidence</Text>
          </View>
          <Text style={styles.symptomsCount}>
            Based on {insight.symptomsAnalyzed} symptoms
          </Text>
          <Text style={styles.timestamp}>
            {formatDate(insight.generatedAt)}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExportPDF}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={[styles.actionText, canExport ? styles.exportButtonText : styles.lockedText]}>
              {canExport ? 'PDF' : '🔒 PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ============================================================
// INSIGHTS LIST
// ============================================================

export const InsightList: React.FC<InsightListProps> = ({
  insights,
  isLoading = false,
  onRefresh,
  onExportPDF
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🧠</Text>
        <Text style={styles.loadingText}>Analyzing your symptoms...</Text>
        <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
      </View>
    )
  }

  if (insights.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>No Insights Yet</Text>
        <Text style={styles.emptyText}>
          Log your symptoms for 7+ days to receive AI-powered pattern analysis.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.listContainer}>
      {insights.map((insight, index) => (
        <InsightCard 
          key={insight.id} 
          insight={insight}
          onExportPDF={onExportPDF ? () => onExportPDF(insight) : undefined}
        />
      ))}
    </View>
  )
}

// ============================================================
// PDF EXPORT COMPONENT
// ============================================================

export const InsightPDFExport: React.FC<{ 
  insight: AIInsightData 
}> = ({ insight }) => {
  // This would use a PDF library in production
  // For now, we show the structure
  
  const generatePDFContent = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return `
HEALTH INSIGHT REPORT
Generated: ${date}
──────────────────────────────

[${insight.triggerType.toUpperCase()}] ${insight.triggerType !== 'general' ? 'Trigger Analysis' : 'General Pattern'}

Confidence: ${Math.round(insight.confidence * 100)}%
Based on: ${insight.symptomsAnalyzed} symptom entries

──────────────────────────────

ANALYSIS:
${insight.text}

──────────────────────────────

⚠️ MEDICAL DISCLAIMER:
This is an AI analysis, not medical advice. 
Please consult your physician.

──────────────────────────────

Generated by AI Symptom Tracker
This report is for informational purposes only.
    `.trim()
  }

  return (
    <View style={styles.pdfContainer}>
      <Text style={styles.pdfTitle}>📄 Export for Doctor</Text>
      <Text style={styles.pdfDescription}>
        Generate a PDF summary of this insight to share with your physician.
      </Text>
      
      <TouchableOpacity 
        style={styles.pdfButton}
        onPress={async () => {
          const content = generatePDFContent()
          // In production, use expo-print or react-native-pdf-lib
          await Share.share({
            message: content,
            title: 'Health Insight Report'
          })
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.pdfButtonIcon}>📄</Text>
        <Text style={styles.pdfButtonText}>Export to PDF</Text>
      </TouchableOpacity>

      <Text style={styles.pdfNote}>
        PDF will include the medical disclaimer required for doctor visits.
      </Text>
    </View>
  )
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  triggerIcon: {
    fontSize: 16,
    marginRight: 6
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  cardContent: {
    marginBottom: 16
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    fontWeight: '400'
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  confidenceBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED'
  },
  symptomsCount: {
    fontSize: 12,
    color: '#6B7280'
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  exportButton: {
    backgroundColor: '#FEF3C7'
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 6
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  exportButtonText: {
    color: '#D97706'
  },
  lockedText: {
    color: '#9CA3AF'
  },

  // List styles
  listContainer: {
    paddingHorizontal: 16
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20
  },

  // PDF Export styles
  pdfContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  pdfDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12
  },
  pdfButtonIcon: {
    fontSize: 18,
    marginRight: 8
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  pdfNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center'
  }
})

// ============================================================
// USAGE EXAMPLES
// ============================================================

/*
import { InsightCard, InsightList, InsightPDFExport } from '@/components/InsightCard'
import { useSubscriptionStore } from '@/store/useSubscriptionStore'

// Single card
const insight = {
  id: '1',
  text: '📊 [85%] correlation: Your headaches occur 3x more frequently on workdays with less than 6 hours of sleep. This is an AI analysis, not medical advice. Please consult your physician.',
  triggerType: 'sleep',
  confidence: 0.85,
  generatedAt: new Date().toISOString(),
  symptomsAnalyzed: 14
}

<InsightCard insight={insight} />

// List of insights
<InsightList 
  insights={insights}
  isLoading={isLoading}
  onRefresh={refetch}
  onExportPDF={handleExportPDF}
/>

// PDF Export section
<InsightPDFExport insight={insight} />

// With premium gate
<AIAccessGate>
  <InsightList insights={insights} />
</AIAccessGate>
*/