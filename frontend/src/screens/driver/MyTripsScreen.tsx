// src/screens/driver/MyTripsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tripsAPI, bookingsAPI } from '../../services/api';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MyTripsScreen({ navigation }: any) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const res = await tripsAPI.getMyTrips();
      setTrips(res.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const changeStatus = (id: number, current: string) => {
    const next: Record<string, string> = {
      PENDING: 'CONFIRMED', CONFIRMED: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
    };
    const nextStatus = next[current];
    if (!nextStatus) return;
    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmer', IN_PROGRESS: 'Démarrer', COMPLETED: 'Terminer',
    };
    Alert.alert(`${labels[nextStatus]} ce trajet ?`, '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: async () => {
          try {
            await tripsAPI.updateStatus(id, nextStatus);
            fetchTrips();
          } catch (e: any) {
            Alert.alert('Erreur', e.response?.data?.message || 'Action impossible');
          }
        }
      },
    ]);
  };

  const statusConfig: any = {
    PENDING:     { color: Colors.warning,   label: 'En attente',  icon: 'time' },
    CONFIRMED:   { color: Colors.accent,    label: 'Confirmé',    icon: 'checkmark-circle' },
    IN_PROGRESS: { color: Colors.primary,   label: 'En cours',    icon: 'car' },
    COMPLETED:   { color: '#9B59B6',        label: 'Terminé',     icon: 'trophy' },
    CANCELLED:   { color: Colors.danger,    label: 'Annulé',      icon: 'close-circle' },
  };

  const nextActionLabel: Record<string, string> = {
    PENDING: 'Confirmer',
    CONFIRMED: 'Démarrer',
    IN_PROGRESS: 'Terminer',
  };

  const renderItem = ({ item }: any) => {
    const sc = statusConfig[item.status] || statusConfig.PENDING;
    const dep = new Date(item.departureTime);
    const booked = item.totalSeats - item.availableSeats;
    const pct = Math.round((booked / item.totalSeats) * 100);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9}
        onPress={() => navigation.navigate('TripDetail', { trip: item })}>
        {/* Header */}
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.route}>{item.departureCity} → {item.arrivalCity}</Text>
            <Text style={styles.date}>{format(dep, 'dd MMM yyyy · HH:mm', { locale: fr })}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sc.color + '20' }]}>
            <Ionicons name={sc.icon} size={12} color={sc.color} />
            <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        {/* Occupancy bar */}
        <View style={styles.occupancyRow}>
          <Text style={styles.occupancyText}>{booked}/{item.totalSeats} places</Text>
          <Text style={styles.occupancyPct}>{pct}%</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: pct > 80 ? Colors.danger : Colors.primary }]} />
        </View>

        {/* Finances */}
        <View style={styles.finRow}>
          <View style={styles.finItem}>
            <Ionicons name="cash" size={14} color={Colors.accent} />
            <Text style={styles.finValue}>{(booked * item.pricePerSeat).toLocaleString()} FCFA</Text>
            <Text style={styles.finLabel}>Gains sièges</Text>
          </View>
          {item.acceptsPackages && (
            <View style={styles.finItem}>
              <Ionicons name="cube" size={14} color={Colors.warning} />
              <Text style={styles.finValue}>{item.pricePerKg?.toLocaleString()} F/kg</Text>
              <Text style={styles.finLabel}>Tarif colis</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.passengersBtn}
            onPress={() => navigation.navigate('TripPassengers', { tripId: item.id })}>
            <Ionicons name="people" size={15} color={Colors.primary} />
            <Text style={styles.passengersBtnText}>Passagers</Text>
          </TouchableOpacity>

          {nextActionLabel[item.status] && (
            <TouchableOpacity style={styles.nextBtn} onPress={() => changeStatus(item.id, item.status)}>
              <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.nextBtnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.nextBtnText}>{nextActionLabel[item.status]}</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Mes trajets</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateTrip')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>{trips.length} trajet(s) au total</Text>
      </LinearGradient>

      {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} /> : (
        <FlatList
          data={trips}
          renderItem={renderItem}
          keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTrips(); }} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={56} color={Colors.textLight} />
              <Text style={styles.emptyText}>Aucun trajet publié</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateTrip')}>
                <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.createBtnGradient}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.createBtnText}>Créer mon premier trajet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  route: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  occupancyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  occupancyText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  occupancyPct: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  barBg: { height: 6, backgroundColor: Colors.bgLight, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  barFill: { height: 6, borderRadius: 3 },
  finRow: { flexDirection: 'row', gap: 12, marginBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  finItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  finValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  finLabel: { fontSize: FontSize.xs, color: Colors.textLight },
  actionsRow: { flexDirection: 'row', gap: 10 },
  passengersBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 10 },
  passengersBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  nextBtn: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
  nextBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  nextBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 12, marginBottom: 20 },
  createBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  createBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
});
