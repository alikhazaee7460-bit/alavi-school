import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

type Message = {
  id: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default function ManageMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (id: string) => {
    await supabase.from('messages').update({ is_read: true }).eq('id', id);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این پیام مطمئنید؟')) {
      await supabase.from('messages').delete().eq('id', id);
      fetchMessages();
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت به داشبورد</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>📬 مدیریت پیام‌ها</Text>
        <Text style={styles.subtitle}>پیام‌های دریافتی از والدین</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
      ) : messages.length === 0 ? (
        <View style={[styles.empty, shadows.soft]}>
          <Text style={styles.emptyText}>هنوز پیامی دریافت نشده است.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.card, shadows.soft, !m.is_read && styles.unreadCard]}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, m.is_read ? styles.badgeRead : styles.badgeNew]}>
                  <Text style={[styles.badgeText, { color: m.is_read ? colors.success : colors.primaryDark }]}>
                    {m.is_read ? 'خوانده شد' : 'جدید'}
                  </Text>
                </View>
                <Text style={styles.dateText}>{new Date(m.created_at).toLocaleDateString('fa-IR')}</Text>
              </View>
              <Text style={styles.subjectText}>{m.subject}</Text>
              <Text style={styles.bodyText}>{m.body}</Text>
              
              <View style={styles.actions}>
                {!m.is_read && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => markAsRead(m.id)}>
                    <Ionicons name="checkmark-done" size={16} color={colors.success} />
                    <Text style={[styles.actionText, { color: colors.success }]}>خوانده شد</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(m.id)}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  backBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { fontFamily: fonts.bold, fontSize: 14, color: colors.secondaryDark },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  list: { gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, borderRightWidth: 3, borderRightColor: colors.border },
  unreadCard: { borderRightColor: colors.primaryDark },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 8 },
  badgeNew: { backgroundColor: colors.primary + '22' },
  badgeRead: { backgroundColor: colors.success + '22' },
  badgeText: { fontFamily: fonts.bold, fontSize: 11 },
  dateText: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  subjectText: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, textAlign: 'right', marginBottom: 6 },
  bodyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'right', lineHeight: 20 },
  actions: { flexDirection: 'row-reverse', gap: 12, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  actionText: { fontFamily: fonts.bold, fontSize: 12 },
  
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});