import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

type Announcement = {
  id: string;
  title: string;
  body: string;
  target_grade: number | null;
  is_school_wide: boolean;
  published_at: string;
};

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, body, target_grade, is_school_wide, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      setAnnouncements((data as Announcement[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      
      {/* دکمه بازگشت */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت به خانه</Text>
      </TouchableOpacity>

      {/* هدر صفحه */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="megaphone" size={32} color={colors.secondaryDark} />
        </View>
        <Text style={styles.title}>📢 اطلاعیه‌های مدرسه</Text>
        <Text style={styles.subtitle}>آخرین اخبار و اطلاعیه‌های رسمی</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
      ) : announcements.length === 0 ? (
        <View style={[styles.empty, shadows.soft]}>
          <Ionicons name="megaphone-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>هنوز اطلاعیه‌ای ثبت نشده است.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {announcements.map((ann) => (
            <View key={ann.id} style={[styles.card, shadows.card]}>
              
              {/* بالای کارت: آیکون و تاریخ */}
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name="megaphone" size={18} color={colors.primaryDark} />
                </View>
                <Text style={styles.dateText}>
                  {new Date(ann.published_at).toLocaleDateString('fa-IR')}
                </Text>
              </View>

              {/* عنوان اطلاعیه */}
              <Text style={styles.cardTitle}>{ann.title}</Text>

              {/* متن اطلاعیه */}
              <Text style={styles.cardBody}>{ann.body}</Text>

              {/* پایین کارت: برچسب (کل مدرسه یا پایه خاص) */}
              <View style={styles.cardFooter}>
                <View style={[
                  styles.badge, 
                  { backgroundColor: ann.is_school_wide ? colors.accent + '22' : colors.secondary + '22' }
                ]}>
                  <Text style={[
                    styles.badgeText, 
                    { color: ann.is_school_wide ? colors.accentDark : colors.secondaryDark }
                  ]}>
                    {ann.is_school_wide ? 'کل مدرسه' : `پایه ${['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'][(ann.target_grade || 1) - 1]}`}
                  </Text>
                </View>
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
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.secondary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'center' },
  
  list: { gap: 16 },
  card: { 
    backgroundColor: colors.white, 
    borderRadius: borderRadius.xl, 
    padding: spacing.lg,
    borderRightWidth: 5,
    borderRightColor: colors.primary, // خط صورتی زیبا در سمت راست
  },
  cardHeader: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.sm 
  },
  iconWrap: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: colors.primary + '22', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  dateText: { 
    fontFamily: fonts.regular, 
    fontSize: 12, 
    color: colors.textMuted 
  },
  cardTitle: { 
    fontFamily: fonts.bold, 
    fontSize: 17, 
    color: colors.text, 
    textAlign: 'right', 
    marginBottom: 8 
  },
  cardBody: { 
    fontFamily: fonts.regular, 
    fontSize: 14, 
    color: colors.textLight, 
    textAlign: 'right', 
    lineHeight: 24 
  },
  cardFooter: { 
    marginTop: spacing.md, 
    paddingTop: spacing.sm, 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
    flexDirection: 'row-reverse' 
  },
  badge: { 
    paddingVertical: 4, 
    paddingHorizontal: 12, 
    borderRadius: 12 
  },
  badgeText: { 
    fontFamily: fonts.bold, 
    fontSize: 11 
  },
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});