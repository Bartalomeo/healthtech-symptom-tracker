/**
 * Subscription Store using Firebase Firestore
 * patreonTier field: 'none' | 'base' | 'premium'
 */

import { create } from 'zustand'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

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
  isLoading: boolean
  features: SubscriptionFeatures
  loadSubscription: (uid: string) => Promise<void>
  setTier: (tier: SubscriptionTier) => void
  devSetTier: (tier: SubscriptionTier) => void
}

const DEFAULT_FEATURES: SubscriptionFeatures = {
  unlimitedSymptoms: false,
  aiInsights: false,
  pdfExport: false,
  weatherIntegration: false,
  advancedTriggers: false
}

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

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'none',
  isLoading: true,
  features: DEFAULT_FEATURES,

  loadSubscription: async (uid: string) => {
    set({ isLoading: true })
    try {
      const docRef = doc(db, 'users', uid)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        const data = snap.data()
        const tier = (data.patreonTier || 'none') as SubscriptionTier
        set({ tier, isLoading: false, features: tierToFeatures(tier) })
      } else {
        set({ tier: 'none', isLoading: false, features: DEFAULT_FEATURES })
      }
    } catch {
      set({ tier: 'none', isLoading: false, features: DEFAULT_FEATURES })
    }
  },

  setTier: (tier: SubscriptionTier) => {
    set({ tier, features: tierToFeatures(tier) })
  },

  devSetTier: (tier: SubscriptionTier) => {
    set({ tier, features: tierToFeatures(tier) })
  }
}))