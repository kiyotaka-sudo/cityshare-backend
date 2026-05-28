// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { tripsAPI } from '../services/api';
import TripCard from '../components/TripCard';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';

export default function HomeScreen({ navigation }: any) {
  const { user, isDriver } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const res = await tripsAPI.getAvailable();
      setTrips(res.data);
    } catch (e) {
      console.log('Error fetching trips', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchTrips(); };

  const quickActions = isDriver
    ? [
        { icon: 'add-circle', label: 'Nouveau trajet', color: Colors.primary, screen: 'CreateTrip' },
        { icon: 'list', label: 'Mes trajets', color: Colors.accent, screen: 'MyTrips' },
        { icon: 'cube', label: 'Colis reçus', color: Colors.warning, screen: 'DriverPackages' },
        { icon: 'star', label: 'Mon profil', color: Colors.secondary, screen: 'Profile' },
      ]
    : [
        { icon: 'search', label: 'Chercher', color: Colors.primary, screen: 'SearchTrips' },
        { icon: 'bookmark', label: 'Réservations', color: Colors.accent, screen: 'MyBookings' },
        { icon: 'cube-outline', label: 'Mes colis', color: Colors.warning, screen: 'MyPackages' },
        { icon: 'person', label: 'Profil', color: Colors.secondary, screen: 'Profile' },
      ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={user?.role === 'DRIVER' ? 'car' : user?.role === 'SENDER' ? 'cube' : 'person'}
                size={12} color={Colors.primary}
              />
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
            <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </LinearGradient>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={9} color="#FFB347" />
              <Text style={styles.ratingText}>{user?.rating?.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('SearchTrips')}
        >
          <Ionicons name="search" size={18} color={Colors.textLight} />
          <Text style={styles.searchPlaceholder}>Où allez-vous ? (ex: Yaoundé → Bafia)</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats banner */}
      <View style={styles.statsContainer}>
        <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.statsBanner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Trajets dispo</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
            <Text style={styles.statLabel}>Trajets sécurisés</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🇨🇲</Text>
            <Text style={styles.statLabel}>Made in CM</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Available trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trajets disponibles</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SearchTrips')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Aucun trajet disponible</Text>
            <Text style={styles.emptySubtext}>Revenez plus tard ou créez le vôtre !</Text>
          </View>
        ) : (
          trips.slice(0, 5).map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => navigation.navigate('TripDetail', { trip })}
            />
          ))
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  userName: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff', marginTop: 2 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(108,99,255,0.2)', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: BorderRadius.full,
    alignSelf: 'flex-start', marginTop: 6,
  },
  roleText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  avatarBtn: { alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.full, marginTop: 4,
  },
  ratingText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  searchPlaceholder: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
  section: { padding: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '22%', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    padding: Spacing.sm, ...Shadow.sm,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  statsContainer: { paddingHorizontal: Spacing.lg },
  statsBanner: { borderRadius: BorderRadius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4 },
});
