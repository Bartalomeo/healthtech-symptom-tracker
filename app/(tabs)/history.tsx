/**
 * History Screen - View all logged symptoms with filtering
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore'
import { db } from '../../src/lib/firebase'
import { useAuthStore } from '../../src/store/useAuthStore'

// Mock data
const MOCK_HISTORY = [
  { id: '1', name: 'Headache', severity: 7, triggers: ['sleep', 'stress'], loggedAt: new Date(), notes: 'After long meeting' },
  { id: '2', name: 'Fatigue', severity: 5, triggers: ['sleep'], loggedAt: new Date(Date.now() - 86400000), notes: '' },
  { id: '3', name: 'Stomach', severity: 3, triggers: ['food'], loggedAt: new Date(Date.now() - 86400000 * 2), notes: 'After lunch' },
  { id: '4', name: 'Anxiety', severity: 6, triggers: ['stress'], loggedAt: new Date(Date.now() - 86400000 * 3), notes: '' },
  { id: '5', name: 'Headache', severity: 4, triggers: [], loggedAt: new Date(Date.now() - 86400000 * 4), notes: 'Morning' }
]

const FILTERS = ['All', 'Headache', 'Fatigue', 'Stomach', 'Anxiety', 'Pain']

export default function HistoryScreen() {
  const { session } = useAuthStore()
  const [history, setHistory] = useState(MOCK_HISTORY)
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredHistory = history.filter(item => {
    const matchesFilter = filter === 'All' || item.name === filter
    const matchesSearch = !searchQuery || item.notes.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return '#10B981'
    if (severity <= 6) return '#FBBF24'
    return '#F97316'
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.symptomName}>{item.name}</Text>
          <Text style={styles.dateText}>{formatDate(item.loggedAt)}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity}/10</Text>
        </View>
      </View>
      
      {item.triggers.length > 0 && (
        <View style={styles.triggersRow}>
          {item.triggers.map((trigger: string) => (
            <View key={trigger} style={styles.triggerBadge}>
              <Text style={styles.triggerText}>{trigger}</Text>
            </View>
          ))}
        </View>
      )}

      {item.notes && (
        <Text style={styles.notesText}>"{item.notes}"</Text>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{history.length} symptoms logged</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No symptoms found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937'
  },
  filtersContainer: {
    marginBottom: 16
  },
  filtersList: {
    paddingHorizontal: 20
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  filterChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED'
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  filterTextActive: {
    color: '#FFFFFF'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  cardHeaderLeft: {
    flex: 1
  },
  symptomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937'
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  triggersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  triggerBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4
  },
  triggerText: {
    fontSize: 12,
    color: '#6B7280'
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280'
  }
})