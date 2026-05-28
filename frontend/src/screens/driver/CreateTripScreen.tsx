// src/screens/driver/CreateTripScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tripsAPI } from '../../services/api';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';

export default function CreateTripScreen({ navigation }: any) {
  const [form, setForm] = useState({
    departureCity: '', arrivalCity: '',
    intermediateStops: '', departureTime: '',
    totalSeats: '4', pricePerSeat: '',
    pricePerKg: '500', acceptsPackages: true,
    vehicleDescription: '', vehiclePlate: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    const { departureCity, arrivalCity, departureTime, totalSeats, pricePerSeat } = form;
    if (!departureCity || !arrivalCity || !departureTime || !pricePerSeat) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    // Parse datetime: expects "DD/MM/YYYY HH:MM"
    let parsedDate: Date;
    try {
      const [datePart, timePart] = departureTime.trim().split(' ');
      const [d, m, y] = datePart.split('/');
      const [h, min] = (timePart || '00:00').split(':');
      parsedDate = new Date(+y, +m - 1, +d, +h, +min);
      if (isNaN(parsedDate.getTime())) throw new Error();
    } catch {
      Alert.alert('Erreur', 'Format de date invalide. Utilisez: DD/MM/YYYY HH:MM');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        departureCity: form.departureCity,
        arrivalCity: form.arrivalCity,
        intermediateStops: form.intermediateStops
          ? JSON.stringify(form.intermediateStops.split(',').map((s: string) => s.trim()))
          : null,
        departureTime: parsedDate.toISOString(),
        totalSeats: parseInt(form.totalSeats),
        pricePerSeat: parseFloat(form.pricePerSeat),
        pricePerKg: parseFloat(form.pricePerKg),
        acceptsPackages: form.acceptsPackages,
        vehicleDescription: form.vehicleDescription,
        vehiclePlate: form.vehiclePlate,
        notes: form.notes,
      };
      await tripsAPI.create(payload);
      Alert.alert('✅ Trajet publié !', 'Votre trajet est maintenant visible par tous les passagers.',
        [{ text: 'Voir mes trajets', onPress: () => navigation.navigate('MyTrips') },
         { text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible de créer le trajet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau trajet</Text>
        <Text style={styles.headerSubtitle}>Publiez votre trajet et gagnez de l'argent</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Route */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Itinéraire</Text>
          <FormField label="Ville de départ *" placeholder="ex: Yaoundé" value={form.departureCity}
            onChange={v => update('departureCity', v)} icon="location" />
          <FormField label="Ville d'arrivée *" placeholder="ex: Bafia" value={form.arrivalCity}
            onChange={v => update('arrivalCity', v)} icon="navigate" />
          <FormField label="Arrêts intermédiaires" placeholder="ex: Obala, Ntui (séparés par virgule)"
            value={form.intermediateStops} onChange={v => update('intermediateStops', v)} icon="ellipsis-horizontal" />
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Date et heure</Text>
          <FormField label="Date et heure de départ *" placeholder="ex: 25/06/2025 08:30"
            value={form.departureTime} onChange={v => update('departureTime', v)} icon="calendar" />
        </View>

        {/* Seats & Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Places et tarifs</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormField label="Nb de places *" placeholder="4" value={form.totalSeats}
                onChange={v => update('totalSeats', v)} icon="people" keyboard="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Prix/place (FCFA) *" placeholder="3000" value={form.pricePerSeat}
                onChange={v => update('pricePerSeat', v)} icon="cash" keyboard="number-pad" />
            </View>
          </View>

          {/* Packages toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Accepter les colis</Text>
              <Text style={styles.toggleSub}>Les expéditeurs pourront vous confier des colis</Text>
            </View>
            <Switch
              value={form.acceptsPackages}
              onValueChange={v => update('acceptsPackages', v)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={form.acceptsPackages ? Colors.primary : '#fff'}
            />
          </View>

          {form.acceptsPackages && (
            <FormField label="Prix/kg pour les colis (FCFA)" placeholder="500" value={form.pricePerKg}
              onChange={v => update('pricePerKg', v)} icon="cube" keyboard="number-pad" />
          )}
        </View>

        {/* Vehicle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Véhicule</Text>
          <FormField label="Description du véhicule" placeholder="ex: Toyota Corolla Bleue"
            value={form.vehicleDescription} onChange={v => update('vehicleDescription', v)} icon="car" />
          <FormField label="Plaque d'immatriculation" placeholder="ex: LT-2341-A"
            value={form.vehiclePlate} onChange={v => update('vehiclePlate', v)} icon="id-card" />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notes</Text>
          <Text style={styles.label}>Informations supplémentaires</Text>
          <TextInput
            style={styles.textarea}
            placeholder="ex: Départ depuis la Gare Routière de Mvan, climatisation disponible..."
            value={form.notes}
            onChangeText={v => update('notes', v)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Aperçu du tarif</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Trajet complet ({form.totalSeats} places)</Text>
            <Text style={styles.previewValue}>
              {(parseFloat(form.pricePerSeat || '0') * parseInt(form.totalSeats || '0')).toLocaleString()} FCFA max
            </Text>
          </View>
          {form.acceptsPackages && (
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Colis (par kg)</Text>
              <Text style={styles.previewValue}>{parseFloat(form.pricePerKg || '0').toLocaleString()} FCFA</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleCreate} disabled={loading} style={styles.submitBtn}>
          <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.submitGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitText}>Publier le trajet</Text>
                </>}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function FormField({ label, placeholder, value, onChange, icon, keyboard }: any) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={ffStyles.label}>{label}</Text>
      <View style={ffStyles.wrapper}>
        <Ionicons name={icon} size={16} color={Colors.textLight} style={{ marginRight: 8 }} />
        <TextInput
          style={ffStyles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard || 'default'}
        />
      </View>
    </View>
  );
}

const ffStyles = StyleSheet.create({
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md, height: 50,
  },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  scroll: { flex: 1 },
  section: { backgroundColor: '#fff', margin: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  row: { flexDirection: 'row' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: Spacing.sm },
  toggleLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  toggleSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  textarea: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.bgLight, minHeight: 100 },
  previewCard: { margin: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.primary + '30' },
  previewTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary, marginBottom: 10 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  previewLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  previewValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  submitBtn: { margin: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18 },
  submitText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
});
