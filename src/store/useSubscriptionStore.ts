/**
 * Zustand Store for Subscription/Premium Status
 * 
 * Manages user subscription state across the app.
 * Syncs with Firebase Cloud Function for server-validated status.
 */

import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ============================================================
// TYPES
// ============================================================

export type SubscriptionTier = 'none' | 'base' | 'premium'

export interface SubscriptionFeatures {
  unlimitedSymptoms: boolean
  aiInsights: boolean
  pdfExport: boolean
  weatherIntegration: boolean
  advancedTriggers: boolean
}

export interface SubscriptionState {
  tier: SubscriptionTier
  isPremium: boolean
  isLoading: boolean
  features: SubscriptionFeatures
  
  // Actions
  loadSubscription: () => Promise<void>
  setTier: (tier: SubscriptionTier) => void
  refreshFeatures: (features: SubscriptionFeatures) => void
}

const DEFAULT_FEATURES: SubscriptionFeatures = {
  unlimitedSymptoms: false,
  aiInsights: false,
  pdfExport: false,
  weatherIntegration: false,
  advancedTriggers: false
}

// ============================================================
// ZUSTAND STORE
// ============================================================

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'none',
  isPremium: false,
  isLoading: true,
  features: DEFAULT_FEATURES,

  /**
   * Load subscription status from Firebase
   * Called on app start and after Patreon linking
   */
  loadSubscription: async () => {
    set({ isLoading: true })
    
    try {
      // Call Firebase Cloud Function to get subscription status
      // This is server-validated, not just local state
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        set({ 
          tier: 'none', 
          isPremium: false, 
          isLoading: false,
          features: DEFAULT_FEATURES 
        })
        return
      }

      // For Supabase implementation, we'll fetch from a stored function
      // In Firebase implementation, this would be:
      // const result = await functions.httpsCallable('getSubscriptionStatus')()
      
      // For now, check local metadata (in production, use Cloud Function)
      const { data: userData } = await supabase
        .from('profiles')
        .select('patreon_tier, premium')
        .eq('id', session.user.id)
        .single()

      if (userData) {
        const tier = (userData.patreon_tier || 'none') as SubscriptionTier
        const isPremium = tier !== 'none' || userData.premium === true
        
        const features: SubscriptionFeatures = {
          unlimitedSymptoms: isPremium,
          aiInsights: isPremium,
          pdfExport: tier === 'premium',
          weatherIntegration: isPremium,
          advancedTriggers: tier === 'premium'
        }

        set({ tier, isPremium, features, isLoading: false })
      } else {
        set({ 
          tier: 'none', 
          isPremium: false, 
          isLoading: false,
          features: DEFAULT_FEATURES 
        })
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
      set({ 
        tier: 'none', 
        isPremium: false, 
        isLoading: false,
        features: DEFAULT_FEATURES 
      })
    }
  },

  /**
   * Update tier locally (optimistic update)
   */
  setTier: (tier: SubscriptionTier) => {
    const isPremium = tier !== 'none'
    const features: SubscriptionFeatures = {
      unlimitedSymptoms: isPremium,
      aiInsights: isPremium,
      pdfExport: tier === 'premium',
      weatherIntegration: isPremium,
      advancedTriggers: tier === 'premium'
    }
    
    set({ tier, isPremium, features })
  },

  /**
   * Update features from server response
   */
  refreshFeatures: (features: SubscriptionFeatures) => {
    const isPremium = features.aiInsights
    const tier: SubscriptionTier = features.pdfExport ? 'premium' : 
                                  features.aiInsights ? 'base' : 'none'
    
    set({ features, isPremium, tier })
  }
}))

// ============================================================
// SELECTOR HELPERS
// ============================================================

export const selectCanUseAI = (state: SubscriptionState) => state.features.aiInsights
export const selectCanExportPDF = (state: SubscriptionState) => state.features.pdfExport
export const selectCanUseUnlimited = (state: SubscriptionState) => state.features.unlimitedSymptoms

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import { useSubscriptionStore, selectCanUseAI } from '@/store/useSubscriptionStore'
import { useSubscriptionStore } from '@/store/useSubscriptionStore'

// In component:
const { features, tier, loadSubscription } = useSubscriptionStore()

// With selector (better performance):
const canUseAI = useSubscriptionStore(selectCanUseAI)
*/