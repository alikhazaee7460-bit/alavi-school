import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [schoolName, setSchoolName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [viceAcademic, setViceAcademic] = useState('');
  const [viceCultural, setViceCultural] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (data) {
        setSchoolName(data.school_name || '');
        setSubtitle(data.subtitle || '');
        setPhone1(data.phone_1 || '');
        setPhone2(data.phone_2 || '');
        setAddress(data.address || '');
        setManagerName(data.manager_name || '');
        setViceAcademic(data.vice_academic_name || '');
        setViceCultural(data.vice_cultural_name || '');
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('settings').update({
      school_name: schoolName,
      subtitle: subtitle,
      phone_1: phone1,
      phone_2: phone2,
      address: address,
      manager_name: managerName,
      vice_academic_name: viceAcademic,
      vice_cultural_name: viceCultural,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);

    setSaving(false);
    if (error) Alert.alert('خطا', 'ذخیره تنظیمات انجام نشد.');
    else Alert.alert('موفق', 'تنظیمات با موفقیت ذخیره شد.');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primaryDark} /></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت به داشبورد</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>⚙️ تنظیمات سیستم</Text>
        <Text style={styles.subtitle}>اطلاعات مدرسه و مدیران را ویرایش کنید</Text>
      </View>

      <View style={[styles.card, shadows.card]}>
        <Text style={styles.label}>نام مدرسه</Text>
        <TextInput style={styles.input} value={schoolName} onChangeText={setSchoolName} textAlign="right" />

        <Text style={styles.label}>زیرعنوان (شعار مدرسه)</Text>
        <TextInput style={styles.input} value={subtitle} onChangeText={setSubtitle} textAlign="right" />

        <Text style={styles.label}>تلفن اول</Text>
        <TextInput style={styles.input} value={phone1} onChangeText={setPhone1} textAlign="right" />

        <Text style={styles.label}>تلفن دوم</Text>
        <TextInput style={styles.input} value={phone2} onChangeText={setPhone2} textAlign="right" />

        <Text style={styles.label}>آدرس</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} textAlign="right" multiline />

        <Text style={styles.label}>نام مدیر مدرسه</Text>
        <TextInput style={styles.input} value={managerName} onChangeText={setManagerName} textAlign="right" />

        <Text style={styles.label}>نام معاون آموزشی</Text>
        <TextInput style={styles.input} value={viceAcademic} onChangeText={setViceAcademic} textAlign="right" />

        <Text style={styles.label}>نام معاون پرورشی</Text>
        <TextInput style={styles.input} value={viceCultural} onChangeText={setViceCultural} textAlign="right" />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ذخیره تغییرات</Text>}
        </TouchableOpacity>
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
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 10, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});