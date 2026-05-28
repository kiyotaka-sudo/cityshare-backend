// src/screens/driver/DriverPackagesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tripsAPI, packagesAPI } from '../../services/api';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';

export default function DriverPackagesScreen({ navigation }: any) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchAllPackages(); }, []);

  const fetchAllPackages = async () => {
    try {
      // Récupère les trajets du conducteur et leurs colis
      const tripsRes = await tripsAPI.getMyTrips();
      const myTrips: any[] = tripsRes.data;
      const pkgPromises = myTrips.map(t => packagesAPI.getTripPackages(t.id));
      const pkgResponses = await Promise.all(pkgPromises);
      const all = pkgResponses.flatMap(r => r.data);
      setPackages(all);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const updateStatus = (id: number, currentStatus: string) => {
    const nextMap: Record<string, string> = {
      PENDING: 'ACCEPTED', ACCEPTED: 'PICKED_UP',
      PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'DELIVERED',
    };
    const labelMap: Record<string, string> = {
      ACCEPTED: 'Accepter', PICKED_UP: 'Ramassé',
      IN_TRANSIT: 'En transit', DELIVERED: 'Livré ✓',
    };
    const next = nextMap[currentStatus];
    if (!next) return;
    Alert.alert(`${labelMap[next]} ce colis ?`, '', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Confirmer', onPress: async () => {
          try {
            await packagesAPI.updateStatus(id, next);
            fetchAllPackages();
          } catch (e: any) {
            Alert.alert('Erreur', e.response?.data?.message || 'Action impossible');
          }
        }
      },
    ]);
  };

  const statusConfig: any = {
    PENDING:    { color: Colors.warning,  label: 'En attente',  icon: 'time',          next: 'Accepter' },
    ACCEPTED:   { color: Colors.primary,  label: 'Accepté',     icon: 'checkmark-circle', next: 'Ramassé' },
    PICKED_UP:  { color: Colors.accent,   label: 'Ramassé',     icon: 'bag-handle',    next: 'En transit' },
    IN_TRANSIT: { color: '#9B59B6',       label: 'En transit',  icon: 'car',           next: 'Livré' },
    DELIVERED:  { color: Colors.accent,   label: 'Livré ✓',     icon: 'trophy',        next: null },
    CANCELLED:  { color: Colors.danger,   label: 'Annulé',      icon: 'close-circle',  next: null },
  };

  const renderItem = ({ item }: any) => {
    const sc = statusConfig[item.status] || statusConfig.PENDING;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.route}>{item.tripRoute}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sc.color + '20' }]}>
            <Ionicons name={sc.icon} size={12} color={sc.color} />
            <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        {/* Weight + price */}
        <View style={styles.chips}>
          {[
            { icon: 'cube',    color: Colors.primary,  label: `${item.weightKg} kg` },
            { icon: 'cash',    color: Colors.accent,   label: `${item.totalPrice?.toLocaleString()} FCFA` },
            { icon: 'warning', color: Colors.warning,  label: item.fragile ? 'Fragile !' : null },
          ].filter(c => c.label).map((c, i) => (
            <View key={i} style={[styles.chip, { backgroundColor: c.color + '15' }]}>
              <Ionicons name={c.icon as any} size={12} color={c.color} />
              <Text style={[styles.chipText, { color: c.color }]}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* Sender & Recipient */}
        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <Ionicons name="person-outline" size={14} color={Colors.primary} />
            <Text style={styles.contactLabel}>Expéditeur:</Text>
            <Text style={styles.contactVal}>{item.senderName}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="person" size={14} color={Colors.secondary} />
            <Text style={styles.contactLabel}>Destinataire:</Text>
            <Text style={styles.contactVal}>{item.recipientName} · {item.recipientPhone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={14} color={Colors.warning} />
            <Text style={styles.contactLabel}>Ramassage:</Text>
            <Text style={styles.contactVal} numberOfLines={1}>{item.pickupAddress}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="navigate-outline" size={14} color={Colors.accent} />
            <Text style={styles.contactLabel}>Livraison:</Text>
            <Text style={styles.contactVal} numberOfLines={1}>{item.deliveryAddress}</Text>
          </View>
        </View>

        {/* Tracking + action */}
        <View style={styles.footer}>
          <View style={styles.trackRow}>
            <Ionicons name="barcode-outline" size={14} color={Colors.primary} />
            <Text style={styles.trackCode}>{item.trackingCode}</Text>
          </View>
          {sc.next && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item.id, item.status)}>
              <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.actionBtnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.actionBtnText}>{sc.next}</Text>
                <Ionicons name="arrow-forward" size={13} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Colis à livrer</Text>
        <Text style={styles.headerSub}>{packages.length} colis au total</Text>
      </LinearGradient>

      {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} /> : (
        <FlatList
          data={packages}
          renderItem={renderItem}
          keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAllPackages(); }} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={56} color={Colors.textLight} />
              <Text style={styles.emptyText}>Aucun colis pour vos trajets</Text>
              <Text style={styles.emptySub}>Les colis apparaîtront ici quand des expéditeurs en confieront</Text>
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
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  desc: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  route: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  chipText: { fontSize: FontSize.xs, fontWeight: '600' },
  contactCard: { backgroundColor: Colors.bgLight, borderRadius: BorderRadius.md, padding: Spacing.md, gap: 6, marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, width: 80 },
  contactVal: { fontSize: FontSize.xs, color: Colors.textPrimary, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackCode: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700', letterSpacing: 0.5 },
  actionBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  actionBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.xl },
  emptyText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary, marginTop: 12, textAlign: 'center' },
  emptySub: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4, textAlign: 'center' },
});
