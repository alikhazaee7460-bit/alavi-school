import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

export default function FeedbackScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('suggestion');

  const submit = async () => {
    if (!title || !body) {
      Alert.alert('توجه', 'لطفاً عنوان و متن پیام را پر کنید.');
      return;
    }
    const { error } = await supabase.from('feedback').insert({
      category, title, body, status: 'new',
    });
    if (error) {
      Alert.alert('خطا', 'مشکلی در ارسال پیش آمد.');
    } else {
      Alert.alert('موفق', 'پیام شما با موفقیت ثبت شد. با تشکر 🌸');
      setTitle(''); setBody('');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="chatbubbles" size={32} color={colors.secondaryDark} />
        </View>
        <Text style={styles.title}>💡 انتقادات و پیشنهادات</Text>
        <Text style={styles.subtitle}>نظر شما باعث پیشرفت مدرسه می‌شود</Text>
      </View>

      <View style={[styles.formCard, shadows.card]}>
        <Text style={styles.label}>نوع پیام</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.optBtn, category === 'suggestion' && styles.optBtnActive]}
            onPress={() => setCategory('suggestion')}
          >
            <Text style={[styles.optText, category === 'suggestion' && styles.optTextActive]}>پیشنهاد</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.optBtn, category === 'criticism' && styles.optBtnActive]}
            onPress={() => setCategory('criticism')}
          >
            <Text style={[styles.optText, category === 'criticism' && styles.optTextActive]}>انتقاد</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>عنوان</Text>
        <TextInput 
          style={styles.input} 
          value={title} 
          onChangeText={setTitle} 
          placeholder="عنوان پیام..." 
          placeholderTextColor={colors.textMuted}
          textAlign="right" 
        />

        <Text style={styles.label}>متن پیام</Text>
        <TextInput 
          style={[styles.input, { height: 120 }]} 
          value={body} 
          onChangeText={setBody} 
          placeholder="متن خود را بنویسید..." 
          placeholderTextColor={colors.textMuted}
          multiline 
          textAlign="right" 
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={submit}>
          <Ionicons name="send" size={18} color={colors.white} />
          <Text style={styles.submitBtnText}>ارسال پیام</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  backBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { fontFamily: fonts.bold, fontSize: 14, color: colors.secondaryDark },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.secondary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'center' },
  
  formCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, marginBottom: 8, marginTop: 12, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', gap: 12 },
  optBtn: { flex: 1, padding: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.cream },
  optBtnActive: { backgroundColor: colors.secondary + '22', borderColor: colors.secondaryDark },
  optText: { fontFamily: fonts.bold, fontSize: 14, color: colors.textLight },
  optTextActive: { color: colors.secondaryDark },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 14, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream },
  submitBtn: { flexDirection: 'row-reverse', backgroundColor: colors.secondaryDark, paddingVertical: 16, borderRadius: borderRadius.pill, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xl },
  submitBtnText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
});