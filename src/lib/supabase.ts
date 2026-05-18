/**
 * Supabase compatibility shim for Firebase-based implementation
 * 
 * This module provides a drop-in replacement for Supabase client
 * using Firebase underneath. Used by useSubscriptionStore.
 * 
 * NOTE: This is a simplified shim. Full Supabase API surface not implemented.
 * Only the methods actually used in the app are stubbed.
 */

import { getAuth, signInAnonymously } from 'firebase/auth'

// Minimal type stubs to satisfy Supabase's API shape
export interface SupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: Session | null } }>
    signInAnonymously: () => Promise<{ data: { session: Session | null } }>
  }
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>
      }
    }
  }
}

export interface Session {
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  }
}

// Create a minimal Supabase-like client wrapping Firebase Auth
// This satisfies the interface used by useSubscriptionStore
export const supabase: SupabaseClient = {
  auth: {
    getSession: async () => {
      const auth = getAuth()
      const user = auth.currentUser
      return {
        data: {
          session: user
            ? {
                user: {
                  id: user.uid,
                  email: user.email ?? undefined,
                  user_metadata: user.metadata ?? {},
                },
              }
            : null,
        },
      }
    },
    signInAnonymously: async () => {
      const credential = await signInAnonymously(getAuth())
      return {
        data: {
          session: {
            user: {
              id: credential.user.uid,
              email: credential.user.email ?? undefined,
              user_metadata: credential.user.metadata ?? {},
            },
          },
        },
      }
    },
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
  }),
}