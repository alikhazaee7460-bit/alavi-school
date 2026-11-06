import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

const GRADES = [1, 2, 3, 4, 5, 6];

export default function HomeworkScreen() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const fetchHomeworks = async (grade: number, className: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('grade', grade)
      .eq('class_name', className)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching homework:', error);
      setHomeworks([]);
    } else {
      setHomeworks(data ?? []);
    }
    setLoading(false);
  };

  const handleClassSelect = (grade: number, className: string) => {
    setSelectedGrade(grade);
    setSelectedClass(className);
    fetchHomeworks(grade, className);
  };

  // 🌟 وقتی کاربر کلاس را انتخاب می‌کند، لیست را دوباره بارگیری کن (برای بعد از تغییر در پنل مدیریت)
  const reload = () => {
    if (selectedGrade && selectedClass) {
      fetchHomeworks(selectedGrade, selectedClass);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => selectedGrade ? (setSelectedGrade(null), setSelectedClass(null)) : router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>{selectedGrade ? 'تغییر کلاس' : 'بازگشت به خانه'}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>📚 تکالیف و آموزش</Text>
        <Text style={styles.subtitle}>مشاهده تکالیف هر کلاس</Text>
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
        <View style={styles.listContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.selectedClassTitle}>
              تکالیف پایه {['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'][selectedGrade - 1]} - {selectedClass}
            </Text>
            {/* 🌟 دکمه بارگیری مجدد */}
            <TouchableOpacity onPress={reload} style={styles.reloadBtn}>
              <Ionicons name="refresh" size={18} color={colors.secondaryDark} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
          ) : homeworks.length === 0 ? (
            <View style={[styles.empty, shadows.soft]}>
              <Ionicons name="book-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>تکلیفی برای این کلاس ثبت نشده است.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {homeworks.map((h) => (
                <View key={h.id} style={[styles.card, shadows.soft]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.subjectBadge}>
                      <Text style={styles.subjectBadgeText}>{h.subject}</Text>
                    </View>
                  </View>
                  <Text style={styles.hwTitle}>{h.title}</Text>
                  {h.description && <Text style={styles.hwDesc}>{h.description}</Text>}
                  
                  <View style={styles.dueDateRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.warning} />
                    <Text style={styles.dueText}>مهلت تحویل: {new Date(h.due_date).toLocaleDateString('fa-IR')}</Text>
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
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  // لیست پایه‌ها
  gradesList: { gap: 16 },
  gradeCard: { backgroundColor: '#FAF5FC', borderRadius: borderRadius.xl, padding: spacing.lg, borderRightWidth: 5, borderRightColor: colors.secondaryDark },
  gradeTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.secondaryDark, textAlign: 'right', marginBottom: spacing.md },
  classButtonsRow: { flexDirection: 'row-reverse', gap: 12 },
  classBtn: { flex: 1, backgroundColor: colors.white, paddingVertical: 16, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: '#EADDF0', alignItems: 'center', shadowColor: '#C9A8E0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  classBtnText: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },

  // لیست تکالیف
  listContainer: { marginTop: spacing.md },
  titleRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  selectedClassTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, flex: 1, textAlign: 'center' },
  reloadBtn: { padding: 8, backgroundColor: colors.secondary + '22', borderRadius: 8 },
  
  list: { gap: 14 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.md },
  cardHeader: { flexDirection: 'row-reverse', marginBottom: 8 },
  subjectBadge: { backgroundColor: colors.warning + '22', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  subjectBadgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.warning },
  hwTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'right', marginBottom: 6 },
  hwDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'right', lineHeight: 22 },
  dueDateRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  dueText: { fontFamily: fonts.bold, fontSize: 12, color: colors.warning },
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});