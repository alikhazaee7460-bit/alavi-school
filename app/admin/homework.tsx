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

type Homework = {
  id: string;
  grade: number;
  class_name: string;
  subject: string;
  title: string;
  description: string | null;
  due_date: string;
};

// تبدیل شمسی به میلادی
function shamsiToMiladi(jy: number, jm: number, jd: number): string {
  let gy = (jy > 979 ? 1600 : 621);
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let days = (jy - (jy > 979 ? 979 : 0)) * 365;
  for (let i = 0; i < jm - 1; i++) days += jDaysInMonth[i];
  days += jd - 1;
  while (days >= 365) { gy++; days -= ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 366 : 365); }
  const gDaysInMonth = [31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (days >= gDaysInMonth[gm]) { days -= gDaysInMonth[gm]; gm++; }
  return `${gy}-${(gm+1).toString().padStart(2,'0')}-${(days+1).toString().padStart(2,'0')}`;
}

export default function ManageHomework() {
  const { profile } = useAuth();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGrade, setNewGrade] = useState(1);
  const [newClass, setNewClass] = useState('یاس ۱');
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const isTeacher = profile?.role === 'teacher';

  const fetchHomeworks = async () => {
    setLoading(true);
    let query = supabase.from('homework').select('*').order('due_date', { ascending: false });

    // 🌟 اگر کاربر معلم است، فقط تکالیف کلاس خودش را ببیند
    if (isTeacher && profile) {
      const { data: teacherClass } = await supabase
        .from('teacher_classes')
        .select('grade, class_name')
        .eq('teacher_id', profile.id)
        .maybeSingle();
      
      if (teacherClass) {
        query = query.eq('grade', teacherClass.grade).eq('class_name', teacherClass.class_name);
      } else {
        // اگر معلم کلاسی ندارد، هیچ تکلیفی نشان نده
        setHomeworks([]);
        setLoading(false);
        return;
      }
    }

    const { data } = await query;
    setHomeworks((data as Homework[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchHomeworks(); }, [profile]);

  const openCreateModal = async () => {
    setEditingId(null);
    setNewSubject(''); setNewTitle(''); setNewDesc(''); setNewDueDate('');
    
    // 🌟 اگر معلم است، پایه و کلاس خودش را خودکار انتخاب کن
    if (isTeacher && profile) {
      const { data: teacherClass } = await supabase
        .from('teacher_classes')
        .select('grade, class_name')
        .eq('teacher_id', profile.id)
        .maybeSingle();
      if (teacherClass) {
        setNewGrade(teacherClass.grade);
        setNewClass(teacherClass.class_name);
      } else {
        Alert.alert('توجه', 'هنوز کلاسی به شما اختصاص داده نشده است. لطفاً با مدیر مدرسه تماس بگیرید.');
        return;
      }
    } else {
      setNewGrade(1); setNewClass('یاس ۱');
    }
    
    setModalVisible(true);
  };

  const openEditModal = (hw: Homework) => {
    setEditingId(hw.id);
    setNewGrade(hw.grade); setNewClass(hw.class_name);
    setNewSubject(hw.subject); setNewTitle(hw.title);
    setNewDesc(hw.description || '');
    setNewDueDate(hw.due_date); 
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!newSubject.trim() || !newTitle.trim() || !newDueDate.trim()) {
      Alert.alert('توجه', 'درس، عنوان و تاریخ الزامی هستند.');
      return;
    }

    let miladiDate = newDueDate;
    if (newDueDate.includes('/')) {
      const parts = newDueDate.trim().split('/');
      if (parts.length !== 3) {
        Alert.alert('خطا', 'فرمت تاریخ اشتباه است. مثلاً 1405/08/20');
        return;
      }
      miladiDate = shamsiToMiladi(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from('homework').update({
        grade: newGrade,
        class_name: newClass,
        subject: newSubject.trim(),
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        due_date: miladiDate,
      }).eq('id', editingId);
      
      if (error) Alert.alert('خطا', 'ویرایش نشد.');
      else { Alert.alert('موفق', 'تکلیف ویرایش شد.'); setModalVisible(false); fetchHomeworks(); }
    } else {
      const { error } = await supabase.from('homework').insert({
        grade: newGrade,
        class_name: newClass,
        subject: newSubject.trim(),
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        due_date: miladiDate,
        created_by: profile?.id,
      });
      
      if (error) Alert.alert('خطا', 'ذخیره نشد.');
      else { Alert.alert('موفق', 'تکلیف اضافه شد.'); setModalVisible(false); fetchHomeworks(); }
    }
    
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('آیا از حذف این تکلیف مطمئن هستید؟');
      if (confirmDelete) {
        supabase.from('homework').delete().eq('id', id).then(({ error }) => {
          if (error) alert('خطا در حذف: ' + error.message);
          else fetchHomeworks();
        });
      }
    } else {
      Alert.alert('حذف', 'آیا مطمئنید؟', [
        { text: 'انصراف', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('homework').delete().eq('id', id);
          if (!error) fetchHomeworks();
        }}
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
          <Text style={styles.backText}>بازگشت به داشبورد</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>📚 مدیریت تکالیف</Text>
          <Text style={styles.subtitle}>
            {isTeacher ? 'شما فقط تکالیف کلاس خود را می‌بینید' : 'مشاهده، ویرایش و حذف تکالیف'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
        ) : homeworks.length === 0 ? (
          <View style={[styles.empty, shadows.soft]}>
            <Text style={styles.emptyText}>هنوز تکلیفی ثبت نشده است.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {homeworks.map((h) => (
              <View key={h.id} style={[styles.card, shadows.soft]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.badgeText}>
                    پایه {['اول','دوم','سوم','چهارم','پنجم','ششم'][h.grade-1]} - {h.class_name} | {h.subject}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(h)}>
                      <Ionicons name="pencil" size={18} color={colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(h.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.subjectText}>{h.title}</Text>
                {h.description && <Text style={styles.descText}>{h.description}</Text>}
                <Text style={styles.dueText}>⏰ مهلت: {new Date(h.due_date).toLocaleDateString('fa-IR')}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, shadows.card]} onPress={openCreateModal}>
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView style={{ maxHeight: '90%' }}>
            <View style={[styles.modalContent, shadows.card]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? 'ویرایش تکلیف' : 'تکلیف جدید'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* 🌟 انتخاب پایه و کلاس: برای معلم غیرفعال است */}
              {!isTeacher && (
                <>
                  <Text style={styles.label}>پایه</Text>
                  <View style={styles.row}>
                    {[1,2,3,4,5,6].map(g => (
                      <TouchableOpacity key={g} style={[styles.chip, newGrade===g && styles.chipActive]} onPress={() => setNewGrade(g)}>
                        <Text style={[styles.chipText, newGrade===g && styles.chipTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>کلاس</Text>
                  <View style={styles.row}>
                    {['یاس ۱','یاس ۲'].map(c => (
                      <TouchableOpacity key={c} style={[styles.chip, newClass===c && styles.chipActive]} onPress={() => setNewClass(c)}>
                        <Text style={[styles.chipText, newClass===c && styles.chipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {isTeacher && (
                <View style={styles.teacherInfoBox}>
                  <Text style={styles.teacherInfoText}>
                    کلاس شما: پایه {['اول','دوم','سوم','چهارم','پنجم','ششم'][newGrade-1]} - {newClass}
                  </Text>
                </View>
              )}

              <Text style={styles.label}>درس *</Text>
              <TextInput style={styles.input} value={newSubject} onChangeText={setNewSubject} placeholder="مثلاً ریاضی" textAlign="right" />

              <Text style={styles.label}>عنوان تکلیف *</Text>
              <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="حل تمرین‌های فصل ۲" textAlign="right" />

              <Text style={styles.label}>توضیحات</Text>
              <TextInput style={[styles.input, { height: 80 }]} value={newDesc} onChangeText={setNewDesc} placeholder="توضیحات..." multiline textAlign="right" textAlignVertical="top" />

              <Text style={styles.label}>مهلت تحویل (مثلاً 1405/08/20) *</Text>
              <TextInput style={styles.input} value={newDueDate} onChangeText={setNewDueDate} placeholder="1405/08/20" keyboardType="numbers-and-punctuation" textAlign="right" />

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
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'center' },
  list: { gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.secondaryDark },
  actions: { flexDirection: 'row-reverse', gap: 12 },
  actionBtn: { padding: 4 },
  subjectText: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'right' },
  descText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'right', marginTop: 4, lineHeight: 20 },
  dueText: { fontFamily: fonts.bold, fontSize: 12, color: colors.warning, marginTop: 8, textAlign: 'right' },
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 10, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.secondaryDark, borderColor: colors.secondaryDark },
  chipText: { fontFamily: fonts.bold, fontSize: 12, color: colors.textLight },
  chipTextActive: { color: colors.white },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  
  // 🌟 استایل جعبه اطلاعات معلم
  teacherInfoBox: { backgroundColor: colors.info + '15', borderWidth: 1, borderColor: colors.info + '30', borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.md },
  teacherInfoText: { fontFamily: fonts.bold, fontSize: 13, color: colors.info, textAlign: 'center' },
});