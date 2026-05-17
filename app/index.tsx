/**
 * Landing Page - Beautiful marketing page for non-logged-in users
 */

import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

export default function LandingPage() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIconContainer}>
            <Text style={styles.heroIcon}>🩺</Text>
          </View>
          <Text style={styles.heroTitle}>AI Symptom Tracker</Text>
          <Text style={styles.heroSubtitle}>
            Understand your body. Track patterns. Get AI-powered insights.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>How It Works</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📝</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Log Your Symptoms</Text>
              <Text style={styles.featureText}>
                Record what you feel, when, and potential triggers like food, weather, or stress.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🧠</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Pattern Analysis</Text>
              <Text style={styles.featureText}>
                Our AI identifies correlations you might miss — like headaches after poor sleep.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📊</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Insights for Your Doctor</Text>
              <Text style={styles.featureText}>
                Export beautiful reports to share with your healthcare provider.
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricing}>
          <Text style={styles.pricingTitle}>Simple Pricing</Text>
          
          <View style={styles.pricingCards}>
            <View style={styles.pricingCard}>
              <Text style={styles.pricingCardName}>Free</Text>
              <Text style={styles.pricingCardPrice}>$0</Text>
              <Text style={styles.pricingCardFeatures}>✓ 10 symptoms/month{'\n'}✓ Basic tracking{'\n'}✓ 7-day history</Text>
            </View>
            
            <View style={[styles.pricingCard, styles.pricingCardHighlight]}>
              <View style={styles.pricingCardBadge}>
                <Text style={styles.pricingCardBadgeText}>POPULAR</Text>
              </View>
              <Text style={styles.pricingCardName}>Base</Text>
              <Text style={styles.pricingCardPrice}>$3/mo</Text>
              <Text style={styles.pricingCardFeatures}>✓ Unlimited symptoms{'\n'}✓ AI Insights{'\n'}✓ Weather correlation</Text>
            </View>
            
            <View style={[styles.pricingCard, styles.pricingCardPremium]}>
              <Text style={styles.pricingCardName}>Premium</Text>
              <Text style={styles.pricingCardPrice}>$5/mo</Text>
              <Text style={styles.pricingCardFeatures}>✓ Everything in Base{'\n'}✓ PDF Export{'\n'}✓ Advanced triggers</Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacy}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            Your data is anonymous. We never collect personal information.
            No names, no emails — just device IDs.
          </Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/disclaimer')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Get Started — It's Free</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

// ============================================================
// IMPORTS
// ============================================================

import { ScrollView } from 'react-native'

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100
  },
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  heroIcon: {
    fontSize: 48
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20
  },
  features: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  featureEmoji: {
    fontSize: 24
  },
  featureContent: {
    flex: 1
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  pricing: {
    marginBottom: 24
  },
  pricingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center'
  },
  pricingCards: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  pricingCardHighlight: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAFAFA'
  },
  pricingCardPremium: {
    borderColor: '#059669'
  },
  pricingCardBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8
  },
  pricingCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  pricingCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4
  },
  pricingCardPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8
  },
  pricingCardFeatures: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: 12
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  ctaButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600'
  }
})