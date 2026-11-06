import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

type Event = {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  venue: string | null;
  description: string | null;
};

const MONTHS = [
  { name: 'مهر', year: '۱۴۰۵', start: '2026-09-23', end: '2026-10-22' },
  { name: 'آبان', year: '۱۴۰۵', start: '2026-10-23', end: '2026-11-21' },
  { name: 'آذر', year: '۱۴۰۵', start: '2026-11-22', end: '2026-12-21' },
  { name: 'دی', year: '۱۴۰۵', start: '2026-12-22', end: '2027-01-20' },
  { name: 'بهمن', year: '۱۴۰۵', start: '2027-01-21', end: '2027-02-19' },
  { name: 'اسفند', year: '۱۴۰۵', start: '2027-02-20', end: '2027-03-20' },
  { name: 'فروردین', year: '۱۴۰۶', start: '2027-03-21', end: '2027-04-20' },
  { name: 'اردیبهشت', year: '۱۴۰۶', start: '2027-04-21', end: '2027-05-21' },
  { name: 'خرداد', year: '۱۴۰۶', start: '2027-05-22', end: '2027-06-21' },
];

export default function CalendarScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 600;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<typeof MONTHS[0] | null>(null);

  const fetchEventsForMonth = async (start: string, end: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('school_events')
      .select('*')
      .gte('event_date', start)
      .lte('event_date', end)
      .order('event_date', { ascending: true });
    
    setEvents((data as Event[]) ?? []);
    setLoading(false);
  };

  const handleMonthSelect = (month: typeof MONTHS[0]) => {
    setSelectedMonth(month);
    fetchEventsForMonth(month.start, month.end);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => selectedMonth ? setSelectedMonth(null) : router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>{selectedMonth ? 'بازگشت به ماه‌ها' : 'بازگشت به خانه'}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar" size={32} color={colors.secondaryDark} />
        </View>
        <Text style={styles.title}>📅 تقویم اجرایی</Text>
        <Text style={styles.subtitle}>سال تحصیلی ۱۴۰۶ - ۱۴۰۵</Text>
      </View>

      {!selectedMonth ? (
        <View style={styles.monthsGrid}>
          {MONTHS.map((month) => (
            <TouchableOpacity
              key={month.name}
              style={[styles.monthCard, shadows.card, isDesktop && { width: '31%' }]}
              onPress={() => handleMonthSelect(month)}
            >
              <Text style={styles.monthIcon}>📅</Text>
              <Text style={styles.monthName}>{month.name}</Text>
              <Text style={styles.monthYear}>{month.year}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.eventsContainer}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedMonthTitle}>
              برنامه‌های ماه {selectedMonth.name} {selectedMonth.year}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
          ) : events.length === 0 ? (
            <View style={[styles.empty, shadows.soft]}>
              <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>برنامه‌ای برای این ماه ثبت نشده است.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {events.map((ev) => (
                <View key={ev.id} style={[styles.eventCard, shadows.card]}>
                  <View style={styles.dateBox}>
                    <Text style={styles.eventDay}>
                      {new Date(ev.event_date).toLocaleDateString('fa-IR', { day: 'numeric' })}
                    </Text>
                    <Text style={styles.eventMonth}>
                      {new Date(ev.event_date).toLocaleDateString('fa-IR', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    {ev.description && (
                      <Text style={styles.eventDesc} numberOfLines={2}>{ev.description}</Text>
                    )}
                    <View style={styles.metaRow}>
                      {ev.start_time && (
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                          <Text style={styles.metaText}>{ev.start_time.slice(0, 5)}</Text>
                        </View>
                      )}
                      {ev.venue && (
                        <View style={styles.metaItem}>
                          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                          <Text style={styles.metaText}>{ev.venue}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  monthsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  monthCard: { width: '31%', backgroundColor: '#FAF5FC', borderRadius: borderRadius.xl, paddingVertical: spacing.lg, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: colors.secondaryDark },
  monthIcon: { fontSize: 28, marginBottom: 8 },
  monthName: { fontFamily: fonts.bold, fontSize: 18, color: colors.secondaryDark, marginBottom: 4 },
  monthYear: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight },
  eventsContainer: { marginTop: spacing.md },
  selectedHeader: { marginBottom: spacing.lg, alignItems: 'center' },
  selectedMonthTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  list: { gap: 14 },
  eventCard: { flexDirection: 'row-reverse', backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.md, gap: 16, borderRightWidth: 5, borderRightColor: colors.primary },
  dateBox: { width: 64, height: 64, borderRadius: borderRadius.lg, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  eventDay: { fontFamily: fonts.bold, fontSize: 22, color: colors.primaryDark },
  eventMonth: { fontFamily: fonts.regular, fontSize: 11, color: colors.textLight },
  infoBox: { flex: 1, justifyContent: 'center' },
  eventTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'right' },
  eventDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, textAlign: 'right', marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 8, gap: 12 },
  metaItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});