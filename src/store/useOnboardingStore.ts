/**
 * Zustand Onboarding Store
 * Manages medical disclaimer acceptance and onboarding flow
 */

import { create } from 'zustand'
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

// ============================================================
// TYPES
// ============================================================

interface OnboardingState {
  disclaimerAccepted: boolean
  onboardingCompleted: boolean
  isLoading: boolean

  // Actions
  loadOnboardingStatus: () => Promise<void>
  acceptDisclaimer: () => Promise<void>
  completeOnboarding: () => Promise<void>
}

// ============================================================
// ZUSTAND STORE
// ============================================================

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  disclaimerAccepted: false,
  onboardingCompleted: false,
  isLoading: true,

  /**
   * Load onboarding status from Firestore
   */
  loadOnboardingStatus: async () => {
    set({ isLoading: true })

    try {
      const { currentUser } = auth
      if (!currentUser) {
        set({ isLoading: false })
        return
      }

      const userRef = doc(db, 'users', currentUser.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        set({
          disclaimerAccepted: data.disclaimerAccepted || false,
          onboardingCompleted: data.onboardingCompleted || false,
          isLoading: false
        })
      } else {
        set({ isLoading: false })
      }
    } catch (err) {
      console.error('Failed to load onboarding status:', err)
      set({ isLoading: false })
    }
  },

  /**
   * Accept medical disclaimer (REQUIRED for App Store)
   */
  acceptDisclaimer: async () => {
    set({ isLoading: true })

    try {
      const { currentUser } = auth
      if (!currentUser) {
        set({ isLoading: false })
        return
      }

      const userRef = doc(db, 'users', currentUser.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          disclaimerAccepted: true,
          disclaimerAcceptedAt: new Date().toISOString()
        })
      } else {
        await setDoc(userRef, {
          disclaimerAccepted: true,
          disclaimerAcceptedAt: new Date().toISOString(),
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          patreonTier: 'none',
          patreonActive: false,
          premium: false
        })
      }

      set({ disclaimerAccepted: true, isLoading: false })
    } catch (err) {
      console.error('Failed to accept disclaimer:', err)
      set({ isLoading: false })
    }
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async () => {
    set({ isLoading: true })

    try {
      const { currentUser } = auth
      if (!currentUser) {
        set({ isLoading: false })
        return
      }

      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString()
      })

      set({ onboardingCompleted: true, isLoading: false })
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
      set({ isLoading: false })
    }
  }
}))