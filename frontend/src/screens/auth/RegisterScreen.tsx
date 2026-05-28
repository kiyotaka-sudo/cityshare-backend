// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../../utils/theme';

const ROLES = [
  { key: 'PASSENGER', label: 'Passager', icon: 'person', desc: 'Réserver des places' },
  { key: 'DRIVER', label: 'Conducteur', icon: 'car', desc: 'Proposer des trajets' },
  { key: 'SENDER', label: 'Expéditeur', icon: 'cube', desc: 'Envoyer des colis' },
];

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', phone: '', role: 'PASSENGER',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const { firstName, lastName, email, password, phone } = form;
    if (!firstName || !lastName || !email || !password || !phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, email: email.trim().toLowerCase() });
    } catch (e: any) {
      Alert.alert('Inscription échouée', e.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="car-sport" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>CityShare</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez la communauté CityShare</Text>

            {/* Rôle */}
            <Text style={styles.label}>Je suis…</Text>
            <View style={styles.roleRow}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleCard, form.role === r.key && styles.roleCardActive]}
                  onPress={() => update('role', r.key)}
                >
                  <Ionicons
                    name={r.icon as any}
                    size={22}
                    color={form.role === r.key ? Colors.primary : Colors.textLight}
                  />
                  <Text style={[styles.roleLabel, form.role === r.key && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nom / Prénom */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Prénom</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Jean" placeholderTextColor={Colors.textLight}
                    value={form.firstName} onChangeText={v => update('firstName', v)} />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Nom</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Fotso" placeholderTextColor={Colors.textLight}
                    value={form.lastName} onChangeText={v => update('lastName', v)} />
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={16} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="votre@email.com" placeholderTextColor={Colors.textLight}
                  value={form.email} onChangeText={v => update('email', v)}
                  keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            {/* Téléphone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={16} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="+237 6XX XXX XXX" placeholderTextColor={Colors.textLight}
                  value={form.phone} onChangeText={v => update('phone', v)} keyboardType="phone-pad" />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor={Colors.textLight}
                  value={form.password} onChangeText={v => update('password', v)} secureTextEntry={!showPwd} />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                  <Ionicons name={showPwd ? 'eye' : 'eye-off'} size={18} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.btn}>
              <LinearGradient colors={['#6C63FF', '#5A52D5']} style={styles.btnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Créer mon compte</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Déjà inscrit ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: 60 },
  backBtn: { position: 'absolute', top: 16, left: Spacing.lg, zIndex: 10 },
  headerSection: { alignItems: 'center', marginBottom: Spacing.lg },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(108,99,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(108,99,255,0.4)',
    marginBottom: 8,
  },
  appName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.xl, padding: Spacing.xl },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  roleCard: {
    flex: 1, alignItems: 'center', padding: 10,
    borderRadius: BorderRadius.md, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.bgLight,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, marginTop: 4 },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 10, color: Colors.textLight, textAlign: 'center', marginTop: 2 },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: Spacing.md },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.md, height: 52,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  btn: { marginTop: Spacing.sm, borderRadius: BorderRadius.md, overflow: 'hidden' },
  btnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: BorderRadius.md },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  loginText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  loginLink: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
