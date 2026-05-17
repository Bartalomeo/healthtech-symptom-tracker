/**
 * Premium Access Wrapper Components
 * 
 * These components check user's subscription status before
 * rendering premium content or granting access to AI features.
 * 
 * Usage:
 * <PremiumGate feature="aiInsights">
 *   <AIInsightsComponent />
 * </PremiumGate>
 * 
 * Or use the hook:
 * const { canAccess, TierBadge } = usePremiumAccess('aiInsights')
 */

import { ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useSubscriptionStore, SubscriptionTier } from '../store/useSubscriptionStore'

// ============================================================
// TYPES
// ============================================================

type FeatureKey = 'aiInsights' | 'pdfExport' | 'unlimitedSymptoms' | 'weatherIntegration' | 'advancedTriggers'

interface PremiumGateProps {
  children: ReactNode
  feature: FeatureKey
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

interface UpgradePromptProps {
  feature: FeatureKey
  currentTier: SubscriptionTier
}

interface FeatureAccessHook {
  canAccess: boolean
  isLoading: boolean
  tier: SubscriptionTier
  TierBadge: () => JSX.Element | null
}

// ============================================================
// TIER BADGE COMPONENT
// ============================================================

const TIER_CONFIG: Record<SubscriptionTier, { label: string; color: string; bgColor: string }> = {
  none: { label: 'Free', color: '#6B7280', bgColor: '#F3F4F6' },
  base: { label: 'Base', color: '#059669', bgColor: '#D1FAE5' },
  premium: { label: 'Premium', color: '#7C3AED', bgColor: '#EDE9FE' }
}

export const TierBadge: React.FC<{ tier?: SubscriptionTier }> = ({ tier = 'none' }) => {
  const config = TIER_CONFIG[tier]
  return (
    <View style={[styles.tierBadge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.tierBadgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  )
}

// ============================================================
// FEATURE CONFIG
// ============================================================

const FEATURE_CONFIG: Record<FeatureKey, { 
  label: string
  requiredTier: SubscriptionTier
  description: string
  upgradeText: string
}> = {
  aiInsights: {
    label: 'AI Insights',
    requiredTier: 'base',
    description: 'Get personalized pattern analysis powered by AI',
    upgradeText: 'Upgrade to Base ($3/mo) or Premium ($5/mo) to unlock AI Insights'
  },
  pdfExport: {
    label: 'PDF Export',
    requiredTier: 'premium',
    description: 'Export your health data as PDF for your doctor',
    upgradeText: 'Upgrade to Premium ($5/mo) to unlock PDF Export'
  },
  unlimitedSymptoms: {
    label: 'Unlimited Symptom Logging',
    requiredTier: 'base',
    description: 'Log as many symptoms as you need',
    upgradeText: 'Upgrade to unlock unlimited symptom logging'
  },
  weatherIntegration: {
    label: 'Weather Integration',
    requiredTier: 'base',
    description: 'See how weather affects your symptoms',
    upgradeText: 'Upgrade to unlock weather correlation'
  },
  advancedTriggers: {
    label: 'Advanced Triggers',
    requiredTier: 'premium',
    description: 'Track more detailed trigger categories',
    upgradeText: 'Upgrade to Premium ($5/mo) for advanced triggers'
  }
}

// ============================================================
// PREMIUM GATE COMPONENT
// ============================================================

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  feature,
  fallback,
  showUpgradePrompt = true
}) => {
  const { features, isLoading } = useSubscriptionStore()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  const hasAccess = features[feature]

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt 
        feature={feature} 
        currentTier={useSubscriptionStore.getState().tier} 
      />
    )
  }

  return null
}

// ============================================================
// UPGRADE PROMPT COMPONENT
// ============================================================

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, currentTier }) => {
  const config = FEATURE_CONFIG[feature]
  const tierConfig = TIER_CONFIG[currentTier]

  const handleUpgrade = () => {
    // Navigate to Patreon subscription page
    // In React Navigation:
    // router.push('/subscription')
    
    // For now, open Patreon link
    Linking.openURL('https://www.patreon.com/healthtech')
  }

  return (
    <View style={styles.upgradeContainer}>
      <View style={styles.upgradeCard}>
        <View style={styles.upgradeHeader}>
          <Text style={styles.upgradeIcon}>🔒</Text>
          <View style={styles.upgradeTitleContainer}>
            <Text style={styles.upgradeTitle}>{config.label}</Text>
            <TierBadge tier={currentTier} />
          </View>
        </View>
        
        <Text style={styles.upgradeDescription}>{config.description}</Text>
        
        <View style={styles.upgradeAction}>
          <Text style={styles.upgradeText}>{config.upgradeText}</Text>
          
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tierComparison}>
          <View style={styles.tierOption}>
            <Text style={styles.tierOptionName}>Base</Text>
            <Text style={styles.tierOptionPrice}>$3/mo</Text>
            <Text style={styles.tierOptionFeatures}>AI Insights</Text>
          </View>
          <View style={styles.tierOptionHighlighted}>
            <Text style={styles.tierOptionName}>Premium</Text>
            <Text style={styles.tierOptionPrice}>$5/mo</Text>
            <Text style={styles.tierOptionFeatures}>AI + PDF Export</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

// ============================================================
// HOOK FOR PROGRAMMATIC ACCESS CHECK
// ============================================================

export function usePremiumAccess(feature: FeatureKey): FeatureAccessHook {
  const { features, isLoading, tier } = useSubscriptionStore()

  const canAccess = features[feature]

  const TierBadgeComponent = () => {
    if (!canAccess) {
      return (
        <View style={[styles.tierBadgeSmall, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.tierBadgeSmallText, { color: '#D97706' }]}>
            {FEATURE_CONFIG[feature].requiredTier.toUpperCase()} Required
          </Text>
        </View>
      )
    }
    return <TierBadge tier={tier} />
  }

  return {
    canAccess,
    isLoading,
    tier,
    TierBadge: TierBadgeComponent
  }
}

// ============================================================
// SPECIFIC FEATURE WRAPPERS
// ============================================================

interface AIAccessGateProps {
  children: ReactNode
  fallback?: ReactNode
}

export const AIAccessGate: React.FC<AIAccessGateProps> = ({ children, fallback }) => (
  <PremiumGate feature="aiInsights" fallback={fallback}>
    {children}
  </PremiumGate>
)

interface PDFExportGateProps {
  children: ReactNode
  fallback?: ReactNode
}

export const PDFExportGate: React.FC<PDFExportGateProps> = ({ children, fallback }) => (
  <PremiumGate feature="pdfExport" fallback={fallback}>
    {children}
  </PremiumGate>
)

interface UnlimitedSymptomsGateProps {
  children: ReactNode
  remaining?: number
  fallback?: ReactNode
}

export const UnlimitedSymptomsGate: React.FC<UnlimitedSymptomsGateProps> = ({ 
  children, 
  remaining = 0,
  fallback 
}) => {
  const { features } = useSubscriptionStore()
  
  if (features.unlimitedSymptoms) {
    return <>{children}</>
  }

  if (remaining > 0) {
    return <>{children}</>
  }

  return (
    <PremiumGate feature="unlimitedSymptoms" fallback={fallback}>
      {children}
    </PremiumGate>
  )
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center'
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14
  },
  upgradeContainer: {
    padding: 16
  },
  upgradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  upgradeIcon: {
    fontSize: 24,
    marginRight: 12
  },
  upgradeTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937'
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20
  },
  upgradeAction: {
    marginBottom: 16
  },
  upgradeText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '500'
  },
  upgradeButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center'
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  tierComparison: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8
  },
  tierOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  tierOptionHighlighted: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB'
  },
  tierOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  tierOptionPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 4
  },
  tierOptionFeatures: {
    fontSize: 12,
    color: '#6B7280'
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  tierBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  tierBadgeSmallText: {
    fontSize: 10,
    fontWeight: '600'
  }
})

// ============================================================
// USAGE EXAMPLES
// ============================================================

/*
// 1. Wrap component with premium gate
import { PremiumGate } from '@/components/PremiumGate'

<PremiumGate feature="aiInsights">
  <AIInsightsCard insights={insights} />
</PremiumGate>

// 2. Use hook for programmatic check
import { usePremiumAccess } from '@/components/PremiumGate'

const { canAccess, TierBadge } = usePremiumAccess('pdfExport')

if (canAccess) {
  // Show PDF export button
}

// 3. Use specific gates
import { AIAccessGate, PDFExportGate } from '@/components/PremiumGate'

<AIAccessGate>
  <AIInsights />
</AIAccessGate>

<PDFExportGate>
  <ExportButton />
</PDFExportGate>

// 4. Show custom fallback
<AIAccessGate fallback={<UpgradeToBASEMessage />}>
  <AIInsights />
</AIAccessGate>
*/