/**
 * Symptom Logging Screen - Beautiful, Intuitive Interface
 * 
 * Features:
 * - Quick symptom selection with severity slider
 * - Trigger checkboxes (food, weather, sleep, stress)
 * - Optional notes
 * - Weather auto-capture
 * - Beautiful card-based UI
 */

import { useState, useEffect } from 'react'
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { collection, doc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../src/lib/firebase'
import { useAuthStore } from '../../src/store/useAuthStore'
import { useSubscriptionStore } from '../../src/store/useSubscriptionStore'

// ============================================================
// CONSTANTS
// ============================================================

const SYMPTOM_TYPES = [
  { id: 'headache', label: 'Headache', icon: '🤕', color: '#FEF3C7' },
  { id: 'fatigue', label: 'Fatigue', icon: '😴', color: '#E0E7FF' },
  { id: 'nausea', label: 'Nausea', icon: '🤢', color: '#FCE7F3' },
  { id: 'dizziness', label: 'Dizziness', icon: '💫', color: '#DBEAFE' },
  { id: 'pain', label: 'Pain', icon: '💉', color: '#FEE2E2' },
  { id: 'stomach', label: 'Stomach', icon: '🤯', color: '#D1FAE5' },
  { id: 'anxiety', label: 'Anxiety', icon: '😰', color: '#FEF3C7' },
  { id: 'insomnia', label: 'Insomnia', icon: '🌙', color: '#E0E7FF' }
]

const TRIGGERS = [
  { id: 'sleep', label: 'Poor Sleep', icon: '😴', color: '#E0E7FF' },
  { id: 'stress', label: 'Stress', icon: '😤', color: '#FCE7F3' },
  { id: 'food', label: 'Food', icon: '🍔', color: '#FED7AA' },
  { id: 'weather', label: 'Weather', icon: '🌧️', color: '#DBEAFE' },
  { id: 'exercise', label: 'Exercise', icon: '🏃', color: '#D1FAE5' },
  { id: 'medication', label: 'Medication', icon: '💊', color: '#F3F4F6' }
]

const SEVERITY_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
const SEVERITY_COLORS = [
  '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', // 1-4 green
  '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7', // 5-8 yellow
  '#F97316', '#FB923C', '#FDBA74', '#FFEDD5'   // 9-10 orange/red
]

// ============================================================
// COMPONENT
// ============================================================

export default function LogScreen() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { features, tier } = useSubscriptionStore()
  
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)
  const [severity, setSeverity] = useState(5)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [symptomCount, setSymptomCount] = useState(0)

  // Check remaining symptoms (for free tier)
  useEffect(() => {
    loadTodaySymptoms()
  }, [])

  const loadTodaySymptoms = async () => {
    // TODO: Query Firestore for today's symptom count
    // For now, just show limit info
    setSymptomCount(3) // Mock
  }

  const toggleTrigger = (triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId)
        ? prev.filter(t => t !== triggerId)
        : [...prev, triggerId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedSymptom) {
      Alert.alert('Select Symptom', 'Please select what you\'re feeling')
      return
    }

    if (!session) {
      Alert.alert('Error', 'Please sign in to log symptoms')
      return
    }

    // Check daily limit for free tier
    if (!features.unlimitedSymptoms && symptomCount >= 10) {
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve logged 10 symptoms this month. Upgrade to Base or Premium for unlimited logging.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') }
        ]
      )
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, 'users', session.uid, 'symptoms'), {
        name: selectedSymptom,
        severity,
        triggers: selectedTriggers,
        notes: notes.trim() || null,
        loggedAt: serverTimestamp(),
        weatherTemp: null, // TODO: Get from weather API
        weatherHumidity: null
      })

      // Success feedback
      Alert.alert(
        '✅ Logged',
        'Your symptom has been recorded.',
        [{ text: 'OK', onPress: () => resetForm() }]
      )
    } catch (err) {
      console.error('Failed to log symptom:', err)
      Alert.alert('Error', 'Failed to save symptom. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedSymptom(null)
    setSeverity(5)
    setSelectedTriggers([])
    setNotes('')
  }

  const getSeverityColor = () => {
    if (severity <= 3) return '#10B981'
    if (severity <= 6) return '#FBBF24'
    return '#F97316'
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>How are you feeling?</Text>
            <Text style={styles.subtitle}>Select your symptom and rate its intensity</Text>
            
            {/* Quick stats */}
            {!features.unlimitedSymptoms && (
              <View style={styles.limitBadge}>
                <Text style={styles.limitText}>
                  {10 - symptomCount} logs remaining this month
                </Text>
              </View>
            )}
          </View>

          {/* Symptom Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's wrong?</Text>
            <View style={styles.symptomGrid}>
              {SYMPTOM_TYPES.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomCard,
                    selectedSymptom === symptom.id && styles.symptomCardSelected
                  ]}
                  onPress={() => setSelectedSymptom(symptom.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                  <Text style={[
                    styles.symptomLabel,
                    selectedSymptom === symptom.id && styles.symptomLabelSelected
                  ]}>
                    {symptom.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity Slider */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Severity</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor() }]}>
                <Text style={styles.severityBadgeText}>{severity}/10</Text>
              </View>
            </View>
            
            <View style={styles.severityContainer}>
              <View style={styles.severityTrack}>
                {[...Array(10)].map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.severityDot,
                      i + 1 <= severity && { backgroundColor: getSeverityColor() },
                      i + 1 === severity && styles.severityDotActive
                    ]}
                    onPress={() => setSeverity(i + 1)}
                  />
                ))}
              </View>
              
              <View style={styles.severityLabels}>
                <Text style={styles.severityLabelText}>Mild</Text>
                <Text style={styles.severityLabelText}>Severe</Text>
              </View>
            </View>

            {/* Severity Description */}
            <View style={styles.severityDescription}>
              <Text style={styles.severityDescriptionText}>
                {severity <= 3 && '⚡ Minor discomfort — easily manageable'}
                {severity >= 4 && severity <= 6 && '📊 Moderate — affecting daily activities'}
                {severity >= 7 && '🔴 Intense — significant impact on well-being'}
              </Text>
            </View>
          </View>

          {/* Triggers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Possible triggers? (optional)</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            
            <View style={styles.triggersGrid}>
              {TRIGGERS.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger.id)
                return (
                  <TouchableOpacity
                    key={trigger.id}
                    style={[
                      styles.triggerCard,
                      isSelected && { backgroundColor: trigger.color, borderColor: trigger.color }
                    ]}
                    onPress={() => toggleTrigger(trigger.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.triggerIcon}>{trigger.icon}</Text>
                    <Text style={[
                      styles.triggerLabel,
                      isSelected && styles.triggerLabelSelected
                    ]}>
                      {trigger.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.triggerCheck}>
                        <Text style={styles.triggerCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any other details that might be relevant..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedSymptom || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedSymptom || isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonIcon}>📝</Text>
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Log Symptom'}
            </Text>
          </TouchableOpacity>

          {/* Medical Disclaimer Footer */}
          <Text style={styles.disclaimerText}>
            Remember: This app does not replace medical advice. 
            Please consult your physician for any concerns.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280'
  },
  limitBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12
  },
  limitText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500'
  },
  section: {
    marginBottom: 28
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  symptomCard: {
    width: '46%',
    marginHorizontal: '2%',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  symptomCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAFAFA'
  },
  symptomIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  symptomLabelSelected: {
    color: '#7C3AED'
  },
  severityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  severityBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  severityTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  severityDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  severityDotActive: {
    borderWidth: 3,
    borderColor: '#1F2937'
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  severityLabelText: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  severityDescription: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8
  },
  severityDescriptionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center'
  },
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  triggerCard: {
    width: '29%',
    marginHorizontal: '2%',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  triggerIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center'
  },
  triggerLabelSelected: {
    color: '#374151'
  },
  triggerCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center'
  },
  triggerCheckText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF'
  },
  submitButtonIcon: {
    fontSize: 20,
    marginRight: 10
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600'
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18
  }
})