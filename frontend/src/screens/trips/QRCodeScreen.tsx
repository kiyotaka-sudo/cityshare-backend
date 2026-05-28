// src/screens/trips/QRCodeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function QRCodeScreen({ route, navigation }: any) {
  const { token, booking } = route.params;
  const depTime = new Date(booking.departureTime);

  const handleShare = async () => {
    await Share.share({
      message: `🚗 CityShare - Mon QR Code d'embarquement\nTrajet: ${booking.tripRoute}\nToken: ${token}`,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code d'embarquement</Text>
        <Text style={styles.headerSub}>Présentez ce code au conducteur</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Trip info */}
        <View style={styles.tripCard}>
          <Text style={styles.tripRoute}>{booking.tripRoute}</Text>
          <Text style={styles.tripDate}>
            {format(depTime, 'EEEE dd MMM · HH:mm', { locale: fr })}
          </Text>
          <View style={styles.tripMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color={Colors.primary} />
              <Text style={styles.metaText}>{booking.seatsBooked} place(s)</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash" size={14} color={Colors.accent} />
              <Text style={styles.metaText}>{booking.totalPrice?.toLocaleString()} FCFA</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color={Colors.warning} />
              <Text style={styles.metaText}>{booking.pickupStop}</Text>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={token}
              size={220}
              color={Colors.textPrimary}
              backgroundColor="#fff"
            />
          </View>
          <Text style={styles.qrHint}>Valide uniquement pour ce trajet</Text>
          <Text style={styles.qrToken} numberOfLines={1} ellipsizeMode="middle">
            {token}
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Comment ça marche ?</Text>
            <Text style={styles.infoText}>
              Le conducteur scannera ce QR Code avant le départ pour vérifier votre identité. Gardez-le accessible sur votre téléphone.
            </Text>
          </View>
        </View>

        {/* Share */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color={Colors.primary} />
          <Text style={styles.shareBtnText}>Partager mon QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { padding: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.xl },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  content: { flex: 1, padding: Spacing.lg },
  tripCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm },
  tripRoute: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  tripDate: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: 10 },
  tripMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bgLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  qrCard: { backgroundColor: '#fff', borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md, ...Shadow.md },
  qrWrapper: { padding: Spacing.md, backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: Colors.primaryLight, marginBottom: Spacing.md },
  qrHint: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 8 },
  qrToken: { fontSize: FontSize.xs, color: Colors.textLight, maxWidth: 240 },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  infoTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  infoText: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 14 },
  shareBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '700' },
});
