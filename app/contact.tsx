import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

export default function ContactScreen() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      setSettings(data);
      setLoading(false);
    })();
  }, []);

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleMap = () => Linking.openURL('https://nshn.ir/ac_bvEaFIxu1Qk');

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primaryDark} /></View>;
  if (!settings) return <View style={styles.center}><Text>اطلاعات یافت نشد.</Text></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت به خانه</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconCircle}><Ionicons name="call" size={32} color={colors.secondaryDark} /></View>
        <Text style={styles.title}>تماس با مدرسه</Text>
        <Text style={styles.subtitle}>{settings.subtitle}</Text>
      </View>

      <Text style={styles.sectionTitle}>کادر مدیریت و معاونت</Text>
      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.cardIcon}>🌱</Text><Text style={styles.cardLabel}>مدیریت مدرسه</Text><Text style={styles.cardValue}>{settings.manager_name}</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>🌱</Text><Text style={styles.cardLabel}>معاون آموزشی</Text><Text style={styles.cardValue}>{settings.vice_academic_name}</Text></View>
        <View style={styles.card}><Text style={styles.cardIcon}>🌱</Text><Text style={styles.cardLabel}>معاون پرورشی</Text><Text style={styles.cardValue}>{settings.vice_cultural_name}</Text></View>
      </View>

      <Text style={styles.sectionTitle}>📞 شماره‌های تماس</Text>
      
      <TouchableOpacity style={[styles.phoneCard, shadows.soft]} onPress={() => handleCall(settings.phone_1)}>
        <View style={styles.phoneIconWrap}><Ionicons name="call" size={22} color={colors.secondaryDark} /></View>
        <View style={styles.phoneInfo}><Text style={styles.phoneLabel}>تلفن مدرسه</Text><Text style={styles.phoneNumber}>{settings.phone_1}</Text></View>
        <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.phoneCard, shadows.soft]} onPress={() => handleCall(settings.phone_2)}>
        <View style={styles.phoneIconWrap}><Ionicons name="call" size={22} color={colors.secondaryDark} /></View>
        <View style={styles.phoneInfo}><Text style={styles.phoneLabel}>تلفن مدرسه</Text><Text style={styles.phoneNumber}>{settings.phone_2}</Text></View>
        <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>📍 نشانی مدرسه</Text>
      <View style={[styles.addressCard, shadows.soft]}>
        <Ionicons name="location" size={24} color={colors.secondaryDark} />
        <Text style={styles.addressText}>{settings.address}</Text>
      </View>

      <TouchableOpacity style={[styles.mapButton, shadows.soft]} onPress={handleMap}>
        <Ionicons name="map" size={22} color={colors.white} />
        <View style={{ flex: 1 }}><Text style={styles.mapBtnTitle}>مسیریابی تا مدرسه</Text><Text style={styles.mapBtnSub}>مشاهده مسیر در نشان</Text></View>
        <Ionicons name="chevron-back" size={20} color={colors.white} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>🕐 ساعات پاسخگویی</Text>
      <View style={[styles.hoursCard, shadows.soft]}>
        <Ionicons name="time" size={28} color="#8b6d2f" />
        <View style={{ flex: 1 }}><Text style={styles.hoursLabel}>زمان پاسخگویی مدرسه</Text><Text style={styles.hoursValue}>۸ صبح الی ۱۳</Text><Text style={styles.hoursNote}>لطفاً در این ساعات با مدرسه تماس بگیرید.</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { fontFamily: fonts.bold, fontSize: 14, color: colors.secondaryDark },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.secondary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'center' },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: 'right' },
  grid: { gap: 10 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', marginBottom: 10 },
  cardIcon: { fontSize: 30, marginBottom: 8 },
  cardLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, marginBottom: 4 },
  cardValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, textAlign: 'center' },
  phoneCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: 12 },
  phoneIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.secondary + '22', alignItems: 'center', justifyContent: 'center' },
  phoneInfo: { flex: 1 },
  phoneLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textLight, textAlign: 'right' },
  phoneNumber: { fontFamily: fonts.bold, fontSize: 16, color: colors.secondaryDark, textAlign: 'right', marginTop: 2 },
  addressCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, gap: 12, marginBottom: spacing.sm },
  addressText: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, flex: 1, textAlign: 'right', lineHeight: 22 },
  mapButton: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.secondaryDark, borderRadius: borderRadius.lg, padding: spacing.md, gap: 12 },
  mapBtnTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.white, textAlign: 'right' },
  mapBtnSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.white, opacity: 0.9, textAlign: 'right', marginTop: 2 },
  hoursCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#F9F2DC', borderRadius: borderRadius.lg, padding: spacing.md, gap: 12, borderWidth: 1, borderColor: '#F0E5BF' },
  hoursLabel: { fontFamily: fonts.regular, fontSize: 11, color: '#806e8a', textAlign: 'right' },
  hoursValue: { fontFamily: fonts.bold, fontSize: 15, color: '#5A4630', textAlign: 'right', marginTop: 2 },
  hoursNote: { fontFamily: fonts.regular, fontSize: 11, color: '#8b6d2f', textAlign: 'right', marginTop: 4 },
});