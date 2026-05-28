// src/screens/trips/TripDetailScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, packagesAPI } from '../../services/api';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TripDetailScreen({ route, navigation }: any) {
  const { trip } = route.params;
  const { user, isDriver } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [seats, setSeats] = useState('1');
  const [pkg, setPkg] = useState({
    description: '', weightKg: '', recipientName: '',
    recipientPhone: '', pickupAddress: '', deliveryAddress: '', fragile: false,
  });

  const departure = new Date(trip.departureTime);
  const isMyTrip = user?.id === trip.driverId;

  const handleBook = async () => {
    const s = parseInt(seats);
    if (isNaN(s) || s < 1 || s > trip.availableSeats) {
      Alert.alert('Erreur', `Nombre de places invalide (max: ${trip.availableSeats})`);
      return;
    }
    setLoading(true);
    try {
      await bookingsAPI.create({ tripId: trip.id, seatsBooked: s });
      setShowBookModal(false);
      Alert.alert('🎉 Réservation confirmée !',
        `${s} place(s) réservée(s) pour ${(trip.pricePerSeat * s).toLocaleString()} FCFA`,
        [{ text: 'Voir mes réservations', onPress: () => navigation.navigate('MyBookings') },
         { text: 'OK' }]);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Réservation échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPackage = async () => {
    if (!pkg.description || !pkg.weightKg || !pkg.recipientName || !pkg.recipientPhone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      const res = await packagesAPI.send({ tripId: trip.id, ...pkg, weightKg: parseFloat(pkg.weightKg) });
      setShowPackageModal(false);
      Alert.alert('📦 Colis envoyé !',
        `Code de suivi: ${res.data.trackingCode}\nPrix: ${res.data.totalPrice?.toLocaleString()} FCFA`,
        [{ text: 'Suivre le colis', onPress: () => navigation.navigate('MyPackages') },
         { text: 'OK' }]);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Envoi échoué');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Détail du trajet</Text>

          <View style={styles.routeHero}>
            <View style={styles.heroCity}>
              <View style={[styles.heroDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.heroCityText}>{trip.departureCity}</Text>
            </View>
            <View style={styles.heroArrow}>
              <View style={styles.heroLine} />
              <Ionicons name="airplane" size={20} color={Colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
              <View style={styles.heroLine} />
            </View>
            <View style={styles.heroCity}>
              <View style={[styles.heroDot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.heroCityText}>{trip.arrivalCity}</Text>
            </View>
          </View>

          {trip.intermediateStops && (
            <View style={styles.heroStops}>
              <Ionicons name="location" size={13} color="rgba(255,255,255,0.5)" />
              <Text style={styles.heroStopsText}>
                Arrêts : {JSON.parse(trip.intermediateStops).join(' → ')}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Info cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <InfoBox icon="calendar" color={Colors.primary} label="Date" value={format(departure, 'dd MMM yyyy', { locale: fr })} />
            <InfoBox icon="time" color={Colors.accent} label="Heure" value={format(departure, 'HH:mm')} />
          </View>
          <View style={styles.infoRow}>
            <InfoBox icon="people" color={Colors.warning} label="Places dispo" value={`${trip.availableSeats} / ${trip.totalSeats}`} />
            <InfoBox icon="cash" color={Colors.secondary} label="Prix/place" value={`${trip.pricePerSeat?.toLocaleString()} F`} />
          </View>
          {trip.acceptsPackages && (
            <View style={styles.infoRow}>
              <InfoBox icon="cube" color="#9B59B6" label="Prix/kg colis" value={`${trip.pricePerKg?.toLocaleString()} F`} />
              <InfoBox icon="shield-checkmark" color={Colors.accent} label="Vérification" value="QR Code" />
            </View>
          )}
        </View>

        {/* Driver card */}
        <View style={styles.driverCard}>
          <Text style={styles.sectionLabel}>Conducteur</Text>
          <View style={styles.driverRow}>
            <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>{trip.driverName?.[0]}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{trip.driverName}</Text>
              <View style={styles.ratingRow}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={13}
                    color={i <= Math.round(trip.driverRating) ? '#FFB347' : Colors.border} />
                ))}
                <Text style={styles.ratingVal}>{trip.driverRating?.toFixed(1)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle */}
        {trip.vehicleDescription && (
          <View style={styles.vehicleCard}>
            <Text style={styles.sectionLabel}>Véhicule</Text>
            <View style={styles.vehicleRow}>
              <Ionicons name="car-sport" size={22} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.vehicleDesc}>{trip.vehicleDescription}</Text>
                {trip.vehiclePlate && <Text style={styles.vehiclePlate}>Immatriculation: {trip.vehiclePlate}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {trip.notes && (
          <View style={styles.notesCard}>
            <Ionicons name="information-circle" size={18} color={Colors.warning} />
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom actions */}
      {!isMyTrip && !isDriver && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => trip.acceptsPackages && setShowPackageModal(true)}
            disabled={!trip.acceptsPackages}
          >
            <Ionicons name="cube-outline" size={18} color={trip.acceptsPackages ? Colors.primary : Colors.textLight} />
            <Text style={[styles.secondaryBtnText, !trip.acceptsPackages && { color: Colors.textLight }]}>
              Envoyer colis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, trip.availableSeats === 0 && styles.disabledBtn]}
            onPress={() => trip.availableSeats > 0 && setShowBookModal(true)}
            disabled={trip.availableSeats === 0}
          >
            <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.primaryGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>
                {trip.availableSeats === 0 ? 'Complet' : 'Réserver'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Book Modal */}
      <Modal visible={showBookModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Réserver ce trajet</Text>
            <Text style={styles.modalRoute}>{trip.departureCity} → {trip.arrivalCity}</Text>
            <Text style={styles.modalLabel}>Nombre de places</Text>
            <TextInput
              style={styles.modalInput}
              value={seats}
              onChangeText={setSeats}
              keyboardType="number-pad"
              maxLength={1}
            />
            <Text style={styles.modalTotal}>
              Total : {(trip.pricePerSeat * (parseInt(seats) || 0)).toLocaleString()} FCFA
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowBookModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleBook} disabled={loading}>
                <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.modalConfirmGradient}>
                  {loading ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.modalConfirmText}>Confirmer</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Package Modal */}
      <Modal visible={showPackageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={[styles.modalCard, { marginTop: 80 }]}>
              <Text style={styles.modalTitle}>📦 Envoyer un colis</Text>
              {[
                { label: 'Description du colis *', key: 'description', placeholder: 'ex: Vêtements, documents...' },
                { label: 'Poids (kg) *', key: 'weightKg', placeholder: 'ex: 2.5', keyboard: 'decimal-pad' },
                { label: 'Nom destinataire *', key: 'recipientName', placeholder: 'Nom complet' },
                { label: 'Tél destinataire *', key: 'recipientPhone', placeholder: '+237 6XX XXX XXX', keyboard: 'phone-pad' },
                { label: 'Adresse ramassage *', key: 'pickupAddress', placeholder: 'Où récupérer le colis' },
                { label: 'Adresse livraison *', key: 'deliveryAddress', placeholder: 'Où livrer le colis' },
              ].map(f => (
                <View key={f.key} style={{ marginBottom: 12 }}>
                  <Text style={styles.modalLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={f.placeholder}
                    value={(pkg as any)[f.key]}
                    onChangeText={v => setPkg(p => ({ ...p, [f.key]: v }))}
                    keyboardType={(f as any).keyboard || 'default'}
                  />
                </View>
              ))}
              {pkg.weightKg ? (
                <Text style={styles.modalTotal}>
                  Coût estimé: {(trip.pricePerKg * (parseFloat(pkg.weightKg) || 0)).toLocaleString()} FCFA
                </Text>
              ) : null}
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPackageModal(false)}>
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={handleSendPackage} disabled={loading}>
                  <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.modalConfirmGradient}>
                    {loading ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.modalConfirmText}>Envoyer</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function InfoBox({ icon, color, label, value }: any) {
  return (
    <View style={infoStyles.box}>
      <View style={[infoStyles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  box: {
    flex: 1, backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    padding: Spacing.md, margin: 4, alignItems: 'center', ...Shadow.sm,
  },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  label: { fontSize: FontSize.xs, color: Colors.textLight, marginBottom: 2 },
  value: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  hero: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  heroTitle: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, marginBottom: Spacing.md },
  routeHero: { flexDirection: 'row', alignItems: 'center' },
  heroCity: { alignItems: 'center', flex: 1 },
  heroDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 6 },
  heroCityText: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroArrow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  heroLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroStops: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  heroStopsText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)' },
  infoSection: { padding: Spacing.md },
  infoRow: { flexDirection: 'row', marginBottom: 0 },
  driverCard: { margin: Spacing.md, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadow.sm },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  driverAvatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  driverName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingVal: { fontSize: FontSize.sm, color: Colors.textSecondary, marginLeft: 4, fontWeight: '600' },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadow.sm },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleDesc: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  vehiclePlate: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  notesCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: Spacing.md, marginBottom: Spacing.md, backgroundColor: '#FFFBEB', borderRadius: BorderRadius.md, padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  notesText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: Spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 30 },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14 },
  secondaryBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  primaryBtn: { flex: 2, borderRadius: BorderRadius.md, overflow: 'hidden' },
  disabledBtn: { opacity: 0.5 },
  primaryGradient: { paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  modalRoute: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  modalLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  modalInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.lg, color: Colors.textPrimary, backgroundColor: Colors.bgLight },
  modalTotal: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary, textAlign: 'center', marginVertical: Spacing.md },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: Spacing.md },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md },
  modalCancelText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
  modalConfirm: { flex: 2, borderRadius: BorderRadius.md, overflow: 'hidden' },
  modalConfirmGradient: { paddingVertical: 14, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
