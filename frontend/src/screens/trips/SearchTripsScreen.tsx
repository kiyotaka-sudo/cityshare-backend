// src/screens/trips/SearchTripsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tripsAPI } from '../../services/api';
import TripCard from '../../components/TripCard';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';

const POPULAR_ROUTES = [
  { from: 'Yaoundé', to: 'Bafia' },
  { from: 'Yaoundé', to: 'Bertoua' },
  { from: 'Douala', to: 'Yaoundé' },
  { from: 'Yaoundé', to: 'Ngaoundéré' },
  { from: 'Douala', to: 'Bafoussam' },
  { from: 'Yaoundé', to: 'Ebolowa' },
];

export default function SearchTripsScreen({ navigation }: any) {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [seats, setSeats] = useState('1');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!departure || !arrival) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await tripsAPI.search({ departure, arrival, seats: parseInt(seats) || 1 });
      setResults(res.data);
    } catch (e) {
      console.log('Search error', e);
    } finally {
      setLoading(false);
    }
  };

  const applyRoute = (r: any) => {
    setDeparture(r.from);
    setArrival(r.to);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rechercher un trajet</Text>

        {/* Search form */}
        <View style={styles.searchCard}>
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: Colors.accent }]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ville de départ"
              placeholderTextColor={Colors.textLight}
              value={departure}
              onChangeText={setDeparture}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ville d'arrivée"
              placeholderTextColor={Colors.textLight}
              value={arrival}
              onChangeText={setArrival}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Ionicons name="people-outline" size={16} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Nombre de places"
              placeholderTextColor={Colors.textLight}
              value={seats}
              onChangeText={setSeats}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.searchBtnGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={styles.searchBtnText}>Rechercher</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Popular routes */}
        {!searched && (
          <View style={styles.popularSection}>
            <Text style={styles.sectionTitle}>🔥 Trajets populaires</Text>
            <View style={styles.routeChips}>
              {POPULAR_ROUTES.map(r => (
                <TouchableOpacity key={`${r.from}-${r.to}`} style={styles.routeChip} onPress={() => applyRoute(r)}>
                  <Text style={styles.routeChipText}>{r.from} → {r.to}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : searched && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              {results.length > 0
                ? `${results.length} trajet(s) trouvé(s)`
                : 'Aucun résultat'}
            </Text>
            {results.length === 0 && (
              <View style={styles.noResult}>
                <Ionicons name="search-outline" size={48} color={Colors.textLight} />
                <Text style={styles.noResultText}>Aucun trajet disponible</Text>
                <Text style={styles.noResultSub}>Essayez d'autres villes ou une autre date</Text>
              </View>
            )}
            {results.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => navigation.navigate('TripDetail', { trip })}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', marginBottom: Spacing.lg },
  searchCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.sm, marginBottom: Spacing.md, ...Shadow.lg },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, paddingVertical: 12 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },
  searchBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  searchBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  searchBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  popularSection: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  routeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  routeChip: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm },
  routeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  resultsSection: { padding: Spacing.lg },
  noResult: { alignItems: 'center', paddingVertical: 40 },
  noResultText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary, marginTop: 12 },
  noResultSub: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4 },
});
