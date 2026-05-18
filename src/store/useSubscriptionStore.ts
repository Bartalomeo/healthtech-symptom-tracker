/**
 * Zustand Store for Subscription/Premium Status
 * 
 * Manages user subscription state across the app.
 * Syncs with Firestore for server-validated status.
 * 
 * IMPORTANT: This store reads from Firebase Firestore (not Supabase).
 * The 'patreonTier' field is stored in each user's Firestore document.
 */

import { create } from 'zustand'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

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
  // Dev mode for testing - bypasses server check
  devSetTier: (tier: SubscriptionTier) => void
}

const DEFAULT_FEATURES: SubscriptionFeatures = {
  unlimitedSymptoms: false,
  aiInsights: false,
  pdfExport: false,
  weatherIntegration: false,
  advancedTriggers: false
}

// ============================================================
// FEATURE CALCULATION
// ============================================================

function tierToFeatures(tier: SubscriptionTier): SubscriptionFeatures {
  const isPremium = tier !== 'none'
  return {
    unlimitedSymptoms: isPremium,
    aiInsights: isPremium,
    pdfExport: tier === 'premium',
    weatherIntegration: isPremium,
    advancedTriggers: tier === 'premium'
  }
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
   * Load subscription status from Firestore
   * Reads 'patreonTier' field from the user's document
   */
  loadSubscription: async () => {
    set({ isLoading: true })
    
    try {
      const { currentUser } = auth
      
      if (!currentUser) {
        set({ 
          tier: 'none', 
          isPremium: false, 
          isLoading: false,
          features: DEFAULT_FEATURES 
        })
        return
      }

      // Read from Firestore
      const userRef = doc(db, 'users', currentUser.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        const tier = (data.patreonTier || 'none') as SubscriptionTier
        const features = tierToFeatures(tier)
        
        set({ 
          tier, 
          isPremium: tier !== 'none', 
          features, 
          isLoading: false 
        })
      } else {
        // New user - no subscription
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
    const features = tierToFeatures(tier)
    set({ tier, isPremium: tier !== 'none', features })
  },

  /**
   * Update features from server response
   */
  refreshFeatures: (features: SubscriptionFeatures) => {
    const isPremium = features.aiInsights
    const tier: SubscriptionTier = features.pdfExport ? 'premium' : 
                                  features.aiInsights ? 'base' : 'none'
    
    set({ features, isPremium, tier })
  },

  /**
   * DEV MODE ONLY: Set tier directly for testing
   * This bypasses server validation - DO NOT use in production
   */
  devSetTier: (tier: SubscriptionTier) => {
    console.warn('[DEV MODE] Setting tier to:', tier)
    const features = tierToFeatures(tier)
    set({ tier, isPremium: tier !== 'none', features })
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

// In component:
const { features, tier, loadSubscription } = useSubscriptionStore()

// With selector (better performance):
const canUseAI = useSubscriptionStore(selectCanUseAI)

// DEV MODE - for testing (e.g., in Settings screen):
const { devSetTier } = useSubscriptionStore()
devSetTier('premium') // Grants all premium features

// To persist dev mode changes to Firestore (for testing):
import { doc, updateDoc } from 'firebase/firestore'
const userRef = doc(db, 'users', currentUser.uid)
await updateDoc(userRef, { patreonTier: 'premium' })
*/