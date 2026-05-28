// src/components/TripCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TripCardProps {
  trip: any;
  onPress: () => void;
  compact?: boolean;
}

export default function TripCard({ trip, onPress, compact }: TripCardProps) {
  const departure = new Date(trip.departureTime);

  const statusColors: any = {
    PENDING: Colors.statusPending,
    CONFIRMED: Colors.statusConfirmed,
    IN_PROGRESS: Colors.accent,
    COMPLETED: Colors.primary,
    CANCELLED: Colors.statusCancelled,
  };

  const statusLabels: any = {
    PENDING: 'Disponible',
    CONFIRMED: 'Confirmé',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.routeContainer}>
          <View style={styles.cityRow}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.city}>{trip.departureCity}</Text>
          </View>
          <View style={styles.routeLine}>
            <View style={styles.dottedLine} />
            <Ionicons name="chevron-forward" size={12} color={Colors.textLight} />
          </View>
          <View style={styles.cityRow}>
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.city}>{trip.arrivalCity}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColors[trip.status] + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[trip.status] }]}>
            {statusLabels[trip.status]}
          </Text>
        </View>
      </View>

      {/* Stops */}
      {trip.intermediateStops && (
        <View style={styles.stopsRow}>
          <Ionicons name="ellipsis-horizontal" size={12} color={Colors.textLight} />
          <Text style={styles.stopsText}>
            via {JSON.parse(trip.intermediateStops).join(' → ')}
          </Text>
        </View>
      )}

      {/* Info grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
          <Text style={styles.infoText}>
            {format(departure, 'dd MMM', { locale: fr })}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={Colors.accent} />
          <Text style={styles.infoText}>
            {format(departure, 'HH:mm')}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={14} color={Colors.warning} />
          <Text style={styles.infoText}>{trip.availableSeats} place{trip.availableSeats > 1 ? 's' : ''}</Text>
        </View>
        {trip.acceptsPackages && (
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={14} color={Colors.secondary} />
            <Text style={styles.infoText}>Colis OK</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.driverRow}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>{trip.driverName?.[0]}</Text>
          </View>
          <View>
            <Text style={styles.driverName}>{trip.driverName}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#FFB347" />
              <Text style={styles.ratingText}>{trip.driverRating?.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        <View>
          <Text style={styles.priceLabel}>par place</Text>
          <Text style={styles.price}>{trip.pricePerSeat?.toLocaleString()} FCFA</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  routeContainer: { flex: 1 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  city: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  routeLine: { flexDirection: 'row', alignItems: 'center', marginLeft: 4, marginVertical: 2 },
  dottedLine: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border, maxWidth: 30 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  stopsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  stopsText: { fontSize: FontSize.xs, color: Colors.textLight },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  infoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgLight, paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  infoText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  driverAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  driverName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textLight, textAlign: 'right' },
  price: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
});
