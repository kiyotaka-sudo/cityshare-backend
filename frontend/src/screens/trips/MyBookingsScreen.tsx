// src/screens/trips/MyBookingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { bookingsAPI } from '../../services/api';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MyBookingsScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getMyBookings();
      setBookings(res.data);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = (id: number) => {
    Alert.alert('Annuler la réservation ?', 'Cette action est irréversible.',
      [{ text: 'Non', style: 'cancel' },
       { text: 'Oui, annuler', style: 'destructive', onPress: async () => {
           try {
             await bookingsAPI.cancel(id);
             fetchBookings();
             Alert.alert('Réservation annulée');
           } catch (e: any) {
             Alert.alert('Erreur', e.response?.data?.message || 'Annulation impossible');
           }
         }
       }]);
  };

  const statusConfig: any = {
    PENDING:   { color: Colors.warning,  icon: 'time',            label: 'En attente' },
    CONFIRMED: { color: Colors.accent,   icon: 'checkmark-circle',label: 'Confirmée' },
    BOARDED:   { color: Colors.primary,  icon: 'car',             label: 'À bord' },
    COMPLETED: { color: '#9B59B6',        icon: 'trophy',          label: 'Terminée' },
    CANCELLED: { color: Colors.danger,   icon: 'close-circle',    label: 'Annulée' },
  };

  const renderItem = ({ item }: any) => {
    const sc = statusConfig[item.status] || statusConfig.PENDING;
    const depTime = new Date(item.departureTime);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.route}>{item.tripRoute}</Text>
            <Text style={styles.date}>
              {format(depTime, 'EEEE dd MMM yyyy à HH:mm', { locale: fr })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.color + '20' }]}>
            <Ionicons name={sc.icon} size={13} color={sc.color} />
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <DetailChip icon="people" color={Colors.primary} label={`${item.seatsBooked} place(s)`} />
          <DetailChip icon="cash" color={Colors.accent} label={`${item.totalPrice?.toLocaleString()} FCFA`} />
          {item.pickupStop && <DetailChip icon="location" color={Colors.warning} label={item.pickupStop} />}
        </View>

        {/* QR Code display */}
        {item.status === 'CONFIRMED' && item.qrCodeToken && (
          <TouchableOpacity style={styles.qrBtn} onPress={() => navigation.navigate('QRCode', { token: item.qrCodeToken, booking: item })}>
            <Ionicons name="qr-code" size={18} color={Colors.primary} />
            <Text style={styles.qrText}>Afficher mon QR Code d'embarquement</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}

        {item.status === 'CONFIRMED' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
            <Text style={styles.cancelText}>Annuler la réservation</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes réservations</Text>
        <Text style={styles.headerSub}>{bookings.length} réservation(s)</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={56} color={Colors.textLight} />
              <Text style={styles.emptyText}>Aucune réservation</Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.exploreBtnText}>Explorer les trajets</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

function DetailChip({ icon, color, label }: any) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[chipStyles.text, { color }]}>{label}</Text>
    </View>
  );
}
const chipStyles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  text: { fontSize: FontSize.xs, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  route: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  qrBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primaryLight, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: 8 },
  qrText: { flex: 1, fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  cancelBtn: { padding: Spacing.sm, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.borderLight },
  cancelText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 12, marginBottom: 20 },
  exploreBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
});
