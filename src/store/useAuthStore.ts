/**
 * Zustand Auth Store
 * Manages anonymous Firebase authentication
 */

import { create } from 'zustand'
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

// ============================================================
// TYPES
// ============================================================

interface AuthState {
  session: User | null
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signInAnon: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

// ============================================================
// ZUSTAND STORE
// ============================================================

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: true,
  error: null,

  /**
   * Initialize auth listener
   */
  initialize: async () => {
    set({ isLoading: true })

    return new Promise((resolve) => {
      // Timeout after 5 seconds - force stop loading
      const timeout = setTimeout(() => {
        console.warn('Auth init timeout - proceeding without Firebase')
        set({ session: null, isLoading: false, error: null })
        resolve()
      }, 5000)

      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          clearTimeout(timeout)
          if (user) {
            // User signed in (anonymous or otherwise)
            set({ session: user, isLoading: false, error: null })

            // Create or update user document in Firestore
            try {
              const userRef = doc(db, 'users', user.uid)
              const userDoc = await getDoc(userRef)

              if (!userDoc.exists()) {
                // First time user - create document
                await setDoc(userRef, {
                  createdAt: new Date().toISOString(),
                  disclaimerAccepted: false,
                  onboardingCompleted: false,
                  patreonTier: 'none',
                  patreonActive: false,
                  premium: false
                })
              }
            } catch (err) {
              console.error('Failed to create user document:', err)
            }
          } else {
            // No user - proceed as guest (no auto sign-in)
            set({ session: null, isLoading: false, error: null })
          }

          unsubscribe()
          resolve()
        })
      } catch (err) {
        clearTimeout(timeout)
        console.error('Firebase auth error:', err)
        set({ session: null, isLoading: false, error: String(err) })
        resolve()
      }
    })
  },

  /**
   * Sign in anonymously
   */
  signInAnon: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await signInAnonymously(auth)
      set({ session: result.user, isLoading: false, error: null })
    } catch (err: any) {
      console.error('Anonymous sign-in failed:', err)
      set({ 
        session: null, 
        isLoading: false, 
        error: err.message || 'Failed to sign in' 
      })
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    set({ isLoading: true })
    
    try {
      const { signOut: firebaseSignOut } = await import('firebase/auth')
      await firebaseSignOut(auth)
      set({ session: null, isLoading: false, error: null })
    } catch (err: any) {
      set({ 
        session: null, 
        isLoading: false, 
        error: err.message || 'Failed to sign out' 
      })
    }
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null })
}))

// ============================================================
// SELECTOR HELPERS
// ============================================================

export const selectIsAuthenticated = (state: AuthState) => !!state.session
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectUserId = (state: AuthState) => state.session?.uid || null