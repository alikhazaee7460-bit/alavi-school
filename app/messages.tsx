import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      Alert.alert('توجه', 'لطفاً موضوع و متن پیام را وارد کنید.');
      return;
    }

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      subject: subject.trim(),
      body: body.trim(),
      is_read: false,
    });

    setSending(false);
    if (error) {
      Alert.alert('خطا', 'ارسال پیام انجام نشد.');
    } else {
      Alert.alert('موفق', 'پیام شما ارسال شد. مدیریت مدرسه به‌زودی پاسخ خواهد داد.');
      setSubject(''); setBody('');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت به خانه</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail" size={32} color={colors.secondaryDark} />
        </View>
        <Text style={styles.title}>💬 ارتباط با مدیریت</Text>
        <Text style={styles.subtitle}>پیام خود را برای مدیر مدرسه ارسال کنید</Text>
      </View>

      <View style={[styles.formCard, shadows.card]}>
        <Text style={styles.label}>موضوع *</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="موضوع پیام..."
          textAlign="right"
        />

        <Text style={styles.label}>متن پیام *</Text>
        <TextInput
          style={[styles.input, { height: 140 }]}
          value={body}
          onChangeText={setBody}
          placeholder="متن پیام خود را بنویسید..."
          multiline
          textAlign="right"
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
          {sending ? <ActivityIndicator color={colors.white} /> : (
            <>
              <Ionicons name="send" size={18} color={colors.white} />
              <Text style={styles.sendBtnText}>ارسال پیام</Text>
            </>
          )}
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
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  formCard: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, marginBottom: 6, marginTop: 12, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 14, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream },
  sendBtn: { flexDirection: 'row-reverse', backgroundColor: colors.secondaryDark, paddingVertical: 16, borderRadius: borderRadius.pill, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xl },
  sendBtnText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
});