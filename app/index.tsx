import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../src/components/Header';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/context/AuthProvider';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';
import { QUICK_ACCESS } from '../src/constants/app';

type Announcement = { id: string; title: string; body: string; published_at: string };
type Event = { id: string; title: string; event_date: string; start_time: string | null; venue: string | null };

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const numCols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const { profile } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [a, e] = await Promise.all([
        supabase.from('announcements').select('id,title,body,published_at')
          .eq('is_published', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('school_events').select('id,title,event_date,start_time,venue')
          .gte('event_date', today).order('event_date').limit(4),
      ]);
      setAnnouncements((a.data as Announcement[]) ?? []);
      setEvents((e.data as Event[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleQuickAccess = (key: string, route: string) => {
    const routeMap: Record<string, string> = {
      phone: '/contact',
      calendar: '/calendar',
      schedule: '/schedule',
      homework: '/homework',
      feedback: '/feedback',
      announcements: '/announcements',
      gallery: '/gallery',
      surveys: '/polls',
      contact: '/messages',
      pta: '/pta',
    };
    
    if (routeMap[key]) {
      router.push(routeMap[key] as any);
    } else if (!route.startsWith('tel:')) {
      router.push(route as any);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* 🌟 هدر اصلی */}
      <Header />

      {/* 🌟 دکمه ورود کارکنان: بالا سمت چپ، کوچک، قرمز و بولد */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topLoginBtn}
          onPress={() => router.push('/auth/login')}
        >
          <Ionicons name="log-in-outline" size={14} color={colors.danger} />
          <Text style={styles.topLoginBtnText}>ورود کارکنان</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        
        {/* خوشامدگویی */}
        <View style={[styles.welcome, shadows.soft]}>
          <Text style={styles.salam}>اَلسّلامُ عَلَیْکَ یا صاحِبَ الزَّمانِ</Text>
          <Text style={styles.welcomeTitle}>خوش آمدید 🌸</Text>
          <Text style={styles.welcomeText}>
            {profile ? `${profile.full_name} عزیز،` : ''} به سامانه ارتباطی مدرسه خوش آمدید.
            از اینجا می‌توانید از اطلاعیه‌ها، برنامه‌های اجرایی و تکالیف فرزندتان مطلع شوید.
          </Text>
        </View>

        {/* دسترسی سریع */}
        <Text style={styles.sectionTitle}>دسترسی سریع</Text>
        <View style={styles.grid}>
          {QUICK_ACCESS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.gridItem, { width: `${(100 / numCols) - 2}%` }, shadows.soft]}
              activeOpacity={0.85}
              onPress={() => handleQuickAccess(item.key, item.route)}
            >
              <View style={[styles.iconBubble, { backgroundColor: item.color + '33' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.gridLabel} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* اطلاعیه‌های مهم */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>اطلاعیه‌های مهم</Text>
          <TouchableOpacity onPress={() => router.push('/announcements')}>
            <Text style={styles.link}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 20 }} />
        ) : announcements.length === 0 ? (
          <EmptyState text="فعلاً اطلاعیه‌ای ثبت نشده است." />
        ) : (
          announcements.map((a) => (
            <View key={a.id} style={[styles.annCard, shadows.soft]}>
              <View style={styles.annIconWrap}>
                <Ionicons name="megaphone" size={20} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.annTitle}>{a.title}</Text>
                <Text style={styles.annBody} numberOfLines={2}>{a.body}</Text>
                <Text style={styles.annDate}>{formatDate(a.published_at)}</Text>
              </View>
            </View>
          ))
        )}

        {/* برنامه‌های نزدیک */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>برنامه‌های نزدیک</Text>
          <TouchableOpacity onPress={() => router.push('/calendar')}>
            <Text style={styles.link}>تقویم کامل</Text>
          </TouchableOpacity>
        </View>
        {events.length === 0 ? (
          <EmptyState text="برنامه‌ای برای روزهای آینده ثبت نشده است." />
        ) : (
          events.map((ev) => (
            <View key={ev.id} style={[styles.eventCard, shadows.soft]}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventDay}>{toPersianDay(ev.event_date)}</Text>
                <Text style={styles.eventMonth}>{toPersianMonth(ev.event_date)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.eventMeta}>{ev.start_time?.slice(0, 5) ?? '—'}</Text>
                  {ev.venue ? (
                    <>
                      <Ionicons name="location-outline" size={14} color={colors.textMuted} style={{ marginRight: 8 }} />
                      <Text style={styles.eventMeta}>{ev.venue}</Text>
                    </>
                  ) : null}
                </View>
              </View>
            </View>
          ))
        )}

        <Text style={styles.footer}>دبستان دخترانه علوی اسلامی © 1405</Text>

      </View>
    </ScrollView>
  );
}

// helpers
function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return ''; }
}
function toPersianDay(iso: string) {
  try { return new Date(iso).toLocaleDateString('fa-IR', { day: 'numeric' }); } catch { return ''; }
}
function toPersianMonth(iso: string) {
  try { return new Date(iso).toLocaleDateString('fa-IR', { month: 'short' }); } catch { return ''; }
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={[styles.empty, shadows.soft]}>
      <Ionicons name="sparkles-outline" size={28} color={colors.secondary} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3EBF5' },
  scrollContent: { paddingBottom: 40 },
  container: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    backgroundColor: colors.background,
    paddingBottom: 20,
  },
  
  // 🌟 استایل‌های نوار بالایی و دکمه ورود قرمز
  topBar: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    alignItems: 'flex-start', // سمت چپ
  },
  topLoginBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.danger + '15', // پس‌زمینه قرمز کم‌رنگ
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.danger + '30', // حاشیه قرمز
  },
  topLoginBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.danger, // متن قرمز
    fontWeight: 'bold',
  },

  welcome: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderRightWidth: 4,
    borderRightColor: colors.primary,
  },
  salam: { fontFamily: fonts.regular, fontSize: 18, color: colors.accentDark, textAlign: 'center' },
  welcomeTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, textAlign: 'center', marginTop: 6 },
  welcomeText: {
    fontFamily: fonts.regular, fontSize: 13, color: colors.textLight,
    textAlign: 'center', lineHeight: 22, marginTop: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold, fontSize: 16, color: colors.text,
    marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  link: { fontFamily: fonts.regular, fontSize: 12, color: colors.secondaryDark },
  grid: {
    flexDirection: 'row-reverse', flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  gridItem: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    margin: 4, alignItems: 'center', minHeight: 105, justifyContent: 'center',
  },
  iconBubble: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  gridLabel: {
    fontFamily: fonts.regular, fontSize: 12, color: colors.text,
    textAlign: 'center', lineHeight: 18,
  },
  annCard: {
    flexDirection: 'row-reverse', backgroundColor: colors.white,
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    borderRadius: borderRadius.lg, padding: spacing.md, gap: 12,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  annIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  annTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, textAlign: 'right' },
  annBody: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, marginTop: 4, textAlign: 'right', lineHeight: 20 },
  annDate: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, marginTop: 6, textAlign: 'right' },
  eventCard: {
    flexDirection: 'row-reverse', backgroundColor: colors.white,
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    borderRadius: borderRadius.lg, padding: spacing.md, gap: 12, alignItems: 'center',
  },
  eventDateBox: {
    width: 52, height: 52, borderRadius: borderRadius.md,
    backgroundColor: colors.secondary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  eventDay: { fontFamily: fonts.bold, fontSize: 18, color: colors.secondaryDark },
  eventMonth: { fontFamily: fonts.regular, fontSize: 10, color: colors.textLight },
  eventTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, textAlign: 'right' },
  eventMetaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 6, gap: 4 },
  eventMeta: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginRight: 2 },
  footer: {
    fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted,
    textAlign: 'center', marginTop: spacing.lg,
  },
  empty: {
    backgroundColor: colors.white, marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', gap: 8,
  },
  emptyText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});