// src/screens/packages/MyPackagesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { packagesAPI } from '../../services/api';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';

export default function MyPackagesScreen({ navigation }: any) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackCode, setTrackCode] = useState('');
  const [tracking, setTracking] = useState(false);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      const res = await packagesAPI.getMyPackages();
      setPackages(res.data);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTrack = async () => {
    if (!trackCode.trim()) return;
    setTracking(true);
    try {
      const res = await packagesAPI.track(trackCode.trim());
      const p = res.data;
      Alert.alert(`📦 Colis ${p.trackingCode}`,
        `Route: ${p.tripRoute}\nStatut: ${p.status}\nDestinataire: ${p.recipientName}\nPrix: ${p.totalPrice?.toLocaleString()} FCFA`);
    } catch (e: any) {
      Alert.alert('Non trouvé', 'Aucun colis avec ce code de suivi');
    } finally {
      setTracking(false);
    }
  };

  const statusConfig: any = {
    PENDING:    { color: Colors.warning,   label: 'En attente', icon: 'time' },
    ACCEPTED:   { color: Colors.primary,   label: 'Accepté',    icon: 'checkmark-circle' },
    PICKED_UP:  { color: Colors.accent,    label: 'Récupéré',   icon: 'bag-handle' },
    IN_TRANSIT: { color: '#9B59B6',        label: 'En route',   icon: 'car' },
    DELIVERED:  { color: Colors.accent,    label: 'Livré',      icon: 'trophy' },
    CANCELLED:  { color: Colors.danger,    label: 'Annulé',     icon: 'close-circle' },
  };

  const renderItem = ({ item }: any) => {
    const sc = statusConfig[item.status] || statusConfig.PENDING;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.route}>{item.tripRoute}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.color + '20' }]}>
            <Ionicons name={sc.icon} size={13} color={sc.color} />
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <InfoChip icon="cube" color={Colors.primary} label={`${item.weightKg} kg`} />
          <InfoChip icon="cash" color={Colors.accent} label={`${item.totalPrice?.toLocaleString()} FCFA`} />
          {item.fragile && <InfoChip icon="warning" color={Colors.warning} label="Fragile" />}
        </View>

        <View style={styles.recipientRow}>
          <Ionicons name="person" size={14} color={Colors.textLight} />
          <Text style={styles.recipientText}>Pour: {item.recipientName} · {item.recipientPhone}</Text>
        </View>

        <View style={styles.trackRow}>
          <Ionicons name="barcode-outline" size={14} color={Colors.primary} />
          <Text style={styles.trackCode}>{item.trackingCode}</Text>
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
        <Text style={styles.headerTitle}>Mes colis</Text>

        {/* Track bar */}
        <View style={styles.trackBar}>
          <Ionicons name="search" size={16} color={Colors.textLight} />
          <TextInput
            style={styles.trackInput}
            placeholder="Code de suivi (ex: CS-123456)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={trackCode}
            onChangeText={setTrackCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity onPress={handleTrack} disabled={tracking}>
            {tracking
              ? <ActivityIndicator color={Colors.primary} size="small" />
              : <Text style={styles.trackBtn}>Suivre</Text>}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={packages}
          renderItem={renderItem}
          keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPackages(); }} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={56} color={Colors.textLight} />
              <Text style={styles.emptyText}>Aucun colis envoyé</Text>
              <Text style={styles.emptySub}>Cherchez un trajet pour envoyer un colis</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function InfoChip({ icon, color, label }: any) {
  return (
    <View style={[chipS.chip, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[chipS.text, { color }]}>{label}</Text>
    </View>
  );
}
const chipS = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  text: { fontSize: FontSize.xs, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', marginBottom: Spacing.md },
  trackBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  trackInput: { flex: 1, color: '#fff', fontSize: FontSize.sm },
  trackBtn: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  desc: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  route: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  recipientRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  recipientText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, padding: 8, borderRadius: BorderRadius.sm },
  trackCode: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700', letterSpacing: 1 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 12, fontWeight: '600' },
  emptySub: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4 },
});
