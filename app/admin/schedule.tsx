import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

const WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
const PERIODS = [
  { type: 'class', label: 'زنگ اول', time: '07:45' },
  { type: 'break', label: 'تفریح', time: '08:25' },
  { type: 'class', label: 'زنگ دوم', time: '08:35' },
  { type: 'break', label: 'تفریح', time: '09:15' },
  { type: 'class', label: 'زنگ سوم', time: '09:45' },
  { type: 'break', label: 'تفریح', time: '10:10' },
  { type: 'class', label: 'زنگ چهارم', time: '10:20' },
  { type: 'break', label: 'تفریح', time: '11:00' },
  { type: 'class', label: 'زنگ پنجم', time: '11:30' },
  { type: 'class', label: 'زنگ ششم', time: '12:00' },
  { type: 'class', label: 'زنگ هفتم', time: '12:30' },
];

export default function ManageSchedule() {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedClass, setSelectedClass] = useState('یاس ۱');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [subjects, setSubjects] = useState<Record<string, string>>({});

  const loadExistingSchedule = async (grade: number, className: string) => {
    setFetching(true);
    const { data, error } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('grade', grade)
      .eq('class_name', className);
      
    if (!error && data) {
      const newSubjects: Record<string, string> = {};
      data.forEach(s => {
        const matchedPeriod = PERIODS.find(p => s.start_time.startsWith(p.time));
        if (matchedPeriod) {
          newSubjects[`${s.weekday}-${matchedPeriod.time}`] = s.subject;
        }
      });
      setSubjects(newSubjects);
    }
    setFetching(false);
  };

  useEffect(() => {
    loadExistingSchedule(selectedGrade, selectedClass);
  }, [selectedGrade, selectedClass]);

  const handleSaveAll = async () => {
    setLoading(true);
    
    await supabase.from('class_schedules').delete().eq('grade', selectedGrade).eq('class_name', selectedClass);
    
    const newSchedules = [];
    for (const [key, subject] of Object.entries(subjects)) {
      if (!subject.trim()) continue;
      const [dayStr, time] = key.split('-');
      const day = parseInt(dayStr);
      newSchedules.push({
        grade: selectedGrade,
        class_name: selectedClass,
        weekday: day,
        start_time: time,
        end_time: '00:00', 
        subject: subject.trim(),
      });
    }

    if (newSchedules.length > 0) {
      const { error } = await supabase.from('class_schedules').insert(newSchedules);
      if (error) {
        Alert.alert('خطا', 'ذخیره نشد: ' + error.message);
      } else {
        Alert.alert('موفق', 'برنامه کلاس با موفقیت ذخیره شد.');
      }
    } else {
      Alert.alert('توجه', 'هیچ درسی وارد نکرده‌اید.');
    }
    setLoading(false);
  };

  const updateSubject = (day: number, time: string, value: string) => {
    setSubjects(prev => ({ ...prev, [`${day}-${time}`]: value }));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت به داشبورد</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🗓️ ثبت برنامه هفتگی</Text>
        <Text style={styles.subtitle}>کل هفته را در یک صفحه وارد کنید</Text>
      </View>

      <View style={styles.selectorsRow}>
        <View style={styles.selectorBox}>
          <Text style={styles.label}>پایه</Text>
          <View style={styles.row}>
            {[1,2,3,4,5,6].map(g => (
              <TouchableOpacity key={g} style={[styles.chip, selectedGrade===g && styles.chipActive]} onPress={() => setSelectedGrade(g)}>
                <Text style={[styles.chipText, selectedGrade===g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.selectorBox}>
          <Text style={styles.label}>کلاس</Text>
          <View style={styles.row}>
            {['یاس ۱','یاس ۲'].map(c => (
              <TouchableOpacity key={c} style={[styles.chip, selectedClass===c && styles.chipActive]} onPress={() => setSelectedClass(c)}>
                <Text style={[styles.chipText, selectedClass===c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {fetching ? (
        <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={[styles.table, shadows.card]}>
            
            {/* 🌟 ردیف اول: ساعت‌ها (افقی) */}
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.headerCell, { width: 80 }]}>
                <Text style={styles.headerCellText}>روز / ساعت</Text>
              </View>
              {PERIODS.map((period, index) => (
                <View key={index} style={[styles.tableCell, styles.headerCell, { width: 85 }]}>
                  <Text style={styles.headerCellText}>{period.label}</Text>
                  <Text style={styles.timeSub}>{period.time}</Text>
                </View>
              ))}
            </View>

            {/* 🌟 ستون اول: روزها (عمودی) */}
            {WEEKDAYS.map((day, dayIndex) => (
              <View key={day} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.dayCell, { width: 80 }]}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
                
                {PERIODS.map((period, pIndex) => {
                  if (period.type === 'break') {
                    return (
                      <View key={pIndex} style={[styles.tableCell, styles.breakCell, { width: 85 }]}>
                        <Text style={styles.breakText}>-</Text>
                      </View>
                    );
                  }
                  return (
                    <View key={pIndex} style={[styles.tableCell, { width: 85, padding: 4 }]}>
                      <TextInput
                        style={styles.cellInput}
                        value={subjects[`${dayIndex}-${period.time}`] || ''}
                        onChangeText={(text) => updateSubject(dayIndex, period.time, text)}
                        placeholder="-"
                        textAlign="center"
                      />
                    </View>
                  );
                })}
              </View>
            ))}

          </View>
        </ScrollView>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ذخیره کل برنامه</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 100, maxWidth: 1000, alignSelf: 'center', width: '100%' },
  backBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { fontFamily: fonts.bold, fontSize: 14, color: colors.secondaryDark },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  selectorsRow: { flexDirection: 'row-reverse', gap: 20, marginBottom: spacing.lg, flexWrap: 'wrap' },
  selectorBox: { flex: 1, minWidth: 150 },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.secondaryDark, borderColor: colors.secondaryDark },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.textLight },
  chipTextActive: { color: colors.white },

  table: { backgroundColor: colors.white, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  tableRow: { flexDirection: 'row-reverse' },
  tableCell: { borderWidth: 1, borderColor: '#E0D0E8', padding: 4, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  headerCell: { backgroundColor: colors.secondary + '22' },
  headerCellText: { fontFamily: fonts.bold, fontSize: 12, color: colors.secondaryDark, textAlign: 'center' },
  dayCell: { backgroundColor: colors.secondary + '11' },
  dayText: { fontFamily: fonts.bold, fontSize: 13, color: colors.secondaryDark, textAlign: 'center' },
  timeSub: { fontFamily: fonts.regular, fontSize: 9, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  breakCell: { backgroundColor: '#F8F4FA' },
  breakText: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted, textAlign: 'center' },
  cellInput: { width: '100%', height: 40, fontFamily: fonts.regular, fontSize: 12, color: colors.text, textAlign: 'center' },
  
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 16, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
});