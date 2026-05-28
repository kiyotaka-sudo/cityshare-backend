// src/screens/profile/ProfileScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../utils/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, isDriver } = useAuth();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    ...(isDriver
      ? [
          { icon: 'add-circle-outline', label: 'Créer un trajet', screen: 'CreateTrip', color: Colors.primary },
          { icon: 'car-outline',         label: 'Mes trajets',     screen: 'MyTrips',    color: Colors.accent },
          { icon: 'cube-outline',        label: 'Colis à livrer',  screen: 'DriverPackages', color: Colors.warning },
        ]
      : [
          { icon: 'search-outline',      label: 'Chercher un trajet',  screen: 'SearchTrips',  color: Colors.primary },
          { icon: 'bookmark-outline',    label: 'Mes réservations',    screen: 'MyBookings',   color: Colors.accent },
          { icon: 'cube-outline',        label: 'Mes colis',           screen: 'MyPackages',   color: Colors.warning },
        ]),
    { icon: 'shield-checkmark-outline', label: 'Sécurité & Vérification', screen: null, color: '#9B59B6' },
    { icon: 'notifications-outline',    label: 'Notifications',          screen: null, color: Colors.secondary },
    { icon: 'help-circle-outline',      label: 'Aide & Support',         screen: null, color: Colors.textSecondary },
  ];

  const stats = isDriver
    ? [
        { label: 'Trajets publiés', value: '—', icon: 'car', color: Colors.primary },
        { label: 'Note moyenne',    value: user?.rating?.toFixed(1) ?? '—', icon: 'star',  color: '#FFB347' },
        { label: 'Avis reçus',      value: user?.totalRatings?.toString() ?? '0', icon: 'chatbubbles', color: Colors.accent },
      ]
    : [
        { label: 'Réservations', value: '—', icon: 'bookmark', color: Colors.primary },
        { label: 'Note passager', value: user?.rating?.toFixed(1) ?? '—', icon: 'star',  color: '#FFB347' },
        { label: 'Colis envoyés', value: '—', icon: 'cube',     color: Colors.warning },
      ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.hero}>
        <View style={styles.avatarWrap}>
          <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </LinearGradient>
          {user?.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="#fff" />
            </View>
          )}
        </View>

        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>

        <View style={styles.rolePill}>
          <Ionicons
            name={user?.role === 'DRIVER' ? 'car' : user?.role === 'SENDER' ? 'cube' : 'person'}
            size={13} color={Colors.primary}
          />
          <Text style={styles.roleText}>{user?.role}</Text>
          {user?.verified && <Text style={styles.verifiedText}> · Vérifié ✓</Text>}
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
              <Ionicons name={s.icon as any} size={18} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Rating bar */}
      <View style={styles.ratingCard}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingBig}>{user?.rating?.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons
                key={i} name="star" size={16}
                color={i <= Math.round(user?.rating ?? 5) ? '#FFB347' : Colors.border}
              />
            ))}
          </View>
          <Text style={styles.ratingCount}>{user?.totalRatings} avis</Text>
        </View>
        <View style={styles.ratingRight}>
          {[5, 4, 3, 2, 1].map(star => {
            const pct = user?.totalRatings
              ? Math.floor(((5 - star + 1) / 5) * 80)
              : star === 5 ? 100 : 0;
            return (
              <View key={star} style={styles.ratingBarRow}>
                <Text style={styles.ratingBarLabel}>{star}</Text>
                <Ionicons name="star" size={10} color="#FFB347" />
                <View style={styles.ratingBarBg}>
                  <View style={[styles.ratingBarFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuCard}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CityShare v1.0.0 · Fait avec ❤️ au Cameroun</Text>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  hero: { alignItems: 'center', paddingTop: 70, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg },
  avatarWrap: { position: 'relative', marginBottom: Spacing.md },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)' },
  avatarText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  phone: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(108,99,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full, marginTop: Spacing.md },
  roleText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
  verifiedText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },
  statsRow: { flexDirection: 'row', margin: Spacing.lg, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', ...Shadow.sm },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textLight, textAlign: 'center', marginTop: 2 },
  ratingCard: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadow.sm },
  ratingLeft: { alignItems: 'center', marginRight: Spacing.lg },
  ratingBig: { fontSize: 42, fontWeight: '800', color: Colors.textPrimary, lineHeight: 48 },
  starsRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  ratingCount: { fontSize: FontSize.xs, color: Colors.textLight },
  ratingRight: { flex: 1, justifyContent: 'center', gap: 4 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingBarLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, width: 10 },
  ratingBarBg: { flex: 1, height: 6, backgroundColor: Colors.bgLight, borderRadius: 3, overflow: 'hidden' },
  ratingBarFill: { height: 6, backgroundColor: '#FFB347', borderRadius: 3 },
  menuCard: { marginHorizontal: Spacing.lg, backgroundColor: '#fff', borderRadius: BorderRadius.lg, ...Shadow.sm, overflow: 'hidden', marginBottom: Spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.dangerLight, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.danger + '30' },
  logoutText: { fontSize: FontSize.md, color: Colors.danger, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textLight, marginBottom: Spacing.sm },
});
