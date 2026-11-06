import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/context/AuthProvider';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

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

export default function ManageCalendar() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🌟 State های مربوط به انتخاب ماه و Modal
  const [selectedMonth, setSelectedMonth] = useState<typeof MONTHS[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!newTitle.trim() || !newDate.trim()) {
      Alert.alert('توجه', 'عنوان و تاریخ الزامی هستند.');
      return;
    }

    // تبدیل ساده شمسی به میلادی (همان الگوریتم قبلی)
    const parts = newDate.trim().split('/');
    if (parts.length !== 3) { Alert.alert('خطا', 'فرمت تاریخ: 1405/08/20'); return; }
    const jy = parseInt(parts[0]), jm = parseInt(parts[1]), jd = parseInt(parts[2]);
    let gy = (jy > 979 ? 1600 : 621);
    const jDays = [31,31,31,31,31,31,30,30,30,30,30,29];
    let days = (jy - (jy > 979 ? 979 : 0)) * 365;
    for (let i=0; i<jm-1; i++) days += jDays[i]; days += jd - 1;
    while (days >= 365) { gy++; days -= ((gy%4===0 && gy%100!==0)||gy%400===0?366:365); }
    const gDays = [31,((gy%4===0 && gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];
    let gm=0; while(days>=gDays[gm]){days-=gDays[gm];gm++;}
    const miladiDate = `${gy}-${(gm+1).toString().padStart(2,'0')}-${(days+1).toString().padStart(2,'0')}`;

    setSaving(true);
    const { error } = await supabase.from('school_events').insert({
      title: newTitle.trim(), event_date: miladiDate, start_time: newTime.trim() || null,
      venue: newVenue.trim() || null, description: newDesc.trim() || null, created_by: profile?.id,
    });

    setSaving(false);
    if (error) Alert.alert('خطا', 'ذخیره نشد.');
    else { 
      Alert.alert('موفق', 'برنامه اضافه شد.'); 
      setModalVisible(false); setNewTitle(''); setNewDate(''); setNewTime(''); setNewVenue(''); setNewDesc('');
      if (selectedMonth) fetchEventsForMonth(selectedMonth.start, selectedMonth.end);
    }
  };

  const handleDelete = async (id: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('آیا از حذف مطمئنید؟')) return;
      await supabase.from('school_events').delete().eq('id', id);
      if (selectedMonth) fetchEventsForMonth(selectedMonth.start, selectedMonth.end);
    } else {
      Alert.alert('حذف', 'مطمئنید؟', [
        { text: 'انصراف', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => {
          await supabase.from('school_events').delete().eq('id', id);
          if (selectedMonth) fetchEventsForMonth(selectedMonth.start, selectedMonth.end);
        }}
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => selectedMonth ? setSelectedMonth(null) : router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
          <Text style={styles.backText}>{selectedMonth ? 'بازگشت به ماه‌ها' : 'بازگشت به داشبورد'}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>📅 مدیریت تقویم اجرایی</Text>
        </View>

        {!selectedMonth ? (
          <View style={styles.monthsGrid}>
            {MONTHS.map((month) => (
              <TouchableOpacity key={month.name} style={[styles.monthCard, shadows.card]} onPress={() => handleMonthSelect(month)}>
                <Text style={styles.monthIcon}>📅</Text>
                <Text style={styles.monthName}>{month.name}</Text>
                <Text style={styles.monthYear}>{month.year}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedMonthTitle}>برنامه‌های ماه {selectedMonth.name} {selectedMonth.year}</Text>
            </View>
            {loading ? <ActivityIndicator color={colors.primaryDark} /> : events.length === 0 ? (
              <Text style={styles.emptyText}>برنامه‌ای ثبت نشده است.</Text>
            ) : (
              <View style={styles.list}>
                {events.map((ev) => (
                  <View key={ev.id} style={[styles.eventCard, shadows.card]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.dateText}>{new Date(ev.event_date).toLocaleDateString('fa-IR')}</Text>
                      <TouchableOpacity onPress={() => handleDelete(ev.id)}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
                    </View>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    {ev.venue && <Text style={styles.eventVenue}>📍 {ev.venue}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 🌟 دکمه شناور فقط وقتی یک ماه انتخاب شده باشد نمایش داده می‌شود */}
      {selectedMonth && (
        <TouchableOpacity style={[styles.fab, shadows.card]} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView style={{ maxHeight: '90%' }}>
            <View style={[styles.modalContent, shadows.card]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>برنامه جدید</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
              </View>
              <Text style={styles.label}>عنوان *</Text>
              <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="مثلاً جشن قرآن" textAlign="right" />
              <Text style={styles.label}>تاریخ (شمسی: 1405/08/20) *</Text>
              <TextInput style={styles.input} value={newDate} onChangeText={setNewDate} placeholder="1405/08/20" textAlign="right" />
              <Text style={styles.label}>ساعت</Text>
              <TextInput style={styles.input} value={newTime} onChangeText={setNewTime} placeholder="10:30" textAlign="right" />
              <Text style={styles.label}>مکان</Text>
              <TextInput style={styles.input} value={newVenue} onChangeText={setNewVenue} placeholder="سالن" textAlign="right" />
              <Text style={styles.label}>توضیحات</Text>
              <TextInput style={[styles.input, { height: 80 }]} value={newDesc} onChangeText={setNewDesc} placeholder="..." multiline textAlign="right" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ذخیره</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 100, maxWidth: 800, alignSelf: 'center', width: '100%' },
  backBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { fontFamily: fonts.bold, fontSize: 14, color: colors.secondaryDark },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  monthsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  monthCard: { width: '31%', backgroundColor: '#FAF5FC', borderRadius: borderRadius.xl, paddingVertical: spacing.lg, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: colors.secondaryDark },
  monthIcon: { fontSize: 28, marginBottom: 8 },
  monthName: { fontFamily: fonts.bold, fontSize: 18, color: colors.secondaryDark, marginBottom: 4 },
  monthYear: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight },
  eventsContainer: { marginTop: spacing.md },
  selectedHeader: { marginBottom: spacing.lg, alignItems: 'center' },
  selectedMonthTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  list: { gap: 12 },
  eventCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dateText: { fontFamily: fonts.bold, fontSize: 13, color: colors.secondaryDark },
  eventTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'right' },
  eventVenue: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 10, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});