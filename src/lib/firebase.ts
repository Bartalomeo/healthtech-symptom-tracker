/**
 * Firebase Configuration
 * Initializes Firebase for anonymous auth and Firestore
 */

import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ============================================================
// FIREBASE CONFIG
// ============================================================

// Firebase Configuration for AI Symptom Tracker
// Project: ai-symptom-tracker-46a67

const firebaseConfig = {
  apiKey: "AIzaSyAcMtquFxaqmk8A1bqFaEiTMgPDcWVCGW8",
  authDomain: "ai-symptom-tracker-46a67.firebaseapp.com",
  projectId: "ai-symptom-tracker-46a67",
  storageBucket: "ai-symptom-tracker-46a67.firebasestorage.app",
  messagingSenderId: "165119651063",
  appId: "1:165119651063:web:17be7ec50aacbdaabc77f2"
};

// ============================================================
// INITIALIZE FIREBASE
// ============================================================

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Auth
export const auth = getAuth(app)

// Initialize Firestore
export const db = getFirestore(app)

// Export app instance for debugging
export default app

// ============================================================
// COLLECTION REFERENCES
// ============================================================

export const collections = {
  users: (userId: string) => `users/${userId}`,
  symptoms: (userId: string) => `users/${userId}/symptoms`,
  insights: (userId: string) => `users/${userId}/insights`
}

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*
import { auth, db, collections } from '@/lib/firebase'
import { signInAnonymously } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'

// Sign in anonymously
const result = await signInAnonymously(auth)
console.log('User:', result.user.uid)

// Add a symptom
await addDoc(collection(db, collections.symptoms(result.user.uid)), {
  name: 'Headache',
  severity: 7,
  triggers: ['sleep', 'stress'],
  loggedAt: new Date().toISOString()
})
*/