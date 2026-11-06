import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

const WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
const GRADES = [1, 2, 3, 4, 5, 6];

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

export default function ScheduleScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;
  
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const fetchSchedule = async (grade: number, className: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('grade', grade)
      .eq('class_name', className);
    
    setSchedules(data ?? []);
    setLoading(false);
  };

  const handleClassSelect = (grade: number, className: string) => {
    setSelectedGrade(grade);
    setSelectedClass(className);
    fetchSchedule(grade, className);
  };

  const getSubject = (dayIndex: number, startTime: string) => {
    const schedule = schedules.find(s => 
      s.weekday === dayIndex && 
      s.start_time.startsWith(startTime)
    );
    return schedule ? schedule.subject : '';
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => selectedGrade ? (setSelectedGrade(null), setSelectedClass(null)) : router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>{selectedGrade ? 'تغییر کلاس' : 'بازگشت به خانه'}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🗓️ برنامه هفتگی</Text>
        <Text style={styles.subtitle}>مشاهده برنامه درسی کلاس‌ها</Text>
      </View>

      {!selectedGrade ? (
        <View style={styles.gradesList}>
          {GRADES.map((grade) => (
            <View key={grade} style={[styles.gradeCard, shadows.card]}>
              <Text style={styles.gradeTitle}>پایه {['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'][grade - 1]}</Text>
              <View style={styles.classButtonsRow}>
                <TouchableOpacity style={styles.classBtn} onPress={() => handleClassSelect(grade, 'یاس ۱')}>
                  <Text style={styles.classBtnText}>یاس ۱</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.classBtn} onPress={() => handleClassSelect(grade, 'یاس ۲')}>
                  <Text style={styles.classBtnText}>یاس ۲</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <Text style={styles.selectedClassTitle}>
            برنامه پایه {['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'][selectedGrade - 1]} - {selectedClass}
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={isDesktop}>
              <View style={[styles.table, shadows.card]}>
                
                {/* 🌟 ردیف اول: ساعت‌ها (افقی) */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.headerCell, { width: 80 }]}>
                    <Text style={styles.headerCellText}>روز / ساعت</Text>
                  </View>
                  {PERIODS.map((period, index) => (
                    <View key={index} style={[styles.tableCell, styles.headerCell, { width: 85 }]}>
                      <Text style={styles.headerCellText}>{period.label}</Text>
                      <Text style={styles.headerTimeText}>{period.time}</Text>
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
                      const subject = getSubject(dayIndex, period.time);
                      return (
                        <View key={pIndex} style={[styles.tableCell, { width: 85 }]}>
                          <Text style={styles.subjectText}>{subject}</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}

              </View>
            </ScrollView>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40, maxWidth: 1000, alignSelf: 'center', width: '100%' },
  backBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { fontFamily: fonts.bold, fontSize: 14, color: colors.secondaryDark },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  gradesList: { gap: 16 },
  gradeCard: { backgroundColor: '#FAF5FC', borderRadius: borderRadius.xl, padding: spacing.lg, borderRightWidth: 5, borderRightColor: colors.secondaryDark },
  gradeTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.secondaryDark, textAlign: 'right', marginBottom: spacing.md },
  classButtonsRow: { flexDirection: 'row-reverse', gap: 12 },
  classBtn: { flex: 1, backgroundColor: colors.white, paddingVertical: 16, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: '#EADDF0', alignItems: 'center' },
  classBtnText: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },

  // 🌟 استایل‌های جدول با ساختار درست
  tableContainer: { alignItems: 'center', width: '100%' },
  selectedClassTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  table: { backgroundColor: colors.white, borderRadius: borderRadius.lg, overflow: 'hidden' },
  tableRow: { flexDirection: 'row-reverse' },
  tableCell: { borderWidth: 1, borderColor: '#E0D0E8', padding: 6, alignItems: 'center', justifyContent: 'center', minHeight: 60 },
  
  // هدر (ساعت‌ها در بالا)
  headerCell: { backgroundColor: colors.secondary + '22' },
  headerCellText: { fontFamily: fonts.bold, fontSize: 12, color: colors.secondaryDark, textAlign: 'center' },
  headerTimeText: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  
  // ستون روزها (عمودی)
  dayCell: { backgroundColor: colors.secondary + '11' },
  dayText: { fontFamily: fonts.bold, fontSize: 13, color: colors.secondaryDark, textAlign: 'center' },
  
  subjectText: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, textAlign: 'center' },
  breakCell: { backgroundColor: '#F8F4FA' },
  breakText: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted, textAlign: 'center' },
});