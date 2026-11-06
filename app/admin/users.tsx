import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type TeacherClass = {
  teacher_id: string;
  grade: number;
  class_name: string;
};

const ROLES = [
  { key: 'school_manager', label: 'مدیر مدرسه' },
  { key: 'vice_academic', label: 'معاون آموزشی' },
  { key: 'vice_cultural', label: 'معاون اجرایی و پرورشی' },
  { key: 'teacher', label: 'معلم' },
];

export default function ManageUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State برای ساخت کاربر جدید
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('teacher');
  const [saving, setSaving] = useState(false);

  // State برای اختصاص کلاس به معلم
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Profile | null>(null);
  const [assignGrade, setAssignGrade] = useState(1);
  const [assignClass, setAssignClass] = useState('یاس ۱');
  const [assignSaving, setAssignSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: classesData } = await supabase.from('teacher_classes').select('*');
    
    setUsers((usersData as Profile[]) ?? []);
    setTeacherClasses((classesData as TeacherClass[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      Alert.alert('توجه', 'لطفاً تمام فیلدها را پر کنید.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('توجه', 'رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setSaving(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: newPassword,
      options: { data: { full_name: newName.trim() } }
    });

    if (authError) {
      setSaving(false);
      Alert.alert('خطا', authError.message);
      return;
    }

    if (authData.user) {
      await supabase.from('profiles').update({ role: newRole }).eq('id', authData.user.id);
    }

    setSaving(false);
    Alert.alert('موفق', 'کاربر جدید ساخته شد.');
    setModalVisible(false);
    setNewName(''); setNewEmail(''); setNewPassword('');
    fetchData();
  };

  const handleToggleActive = async (user: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id);
    if (!error) fetchData();
  };

  // 🌟 اختصاص کلاس به معلم
  const openAssignModal = (teacher: Profile) => {
    setSelectedTeacher(teacher);
    // اگر قبلاً کلاسی اختصاص یافته، آن را نمایش بده
    const existing = teacherClasses.find(tc => tc.teacher_id === teacher.id);
    if (existing) {
      setAssignGrade(existing.grade);
      setAssignClass(existing.class_name);
    } else {
      setAssignGrade(1);
      setAssignClass('یاس ۱');
    }
    setAssignModalVisible(true);
  };

  const handleAssignClass = async () => {
    if (!selectedTeacher) return;
    setAssignSaving(true);

    // حذف اختصاص قبلی
    await supabase.from('teacher_classes').delete().eq('teacher_id', selectedTeacher.id);

    // اختصاص جدید
    const { error } = await supabase.from('teacher_classes').insert({
      teacher_id: selectedTeacher.id,
      grade: assignGrade,
      class_name: assignClass,
    });

    setAssignSaving(false);
    if (error) {
      Alert.alert('خطا', 'اختصاص کلاس انجام نشد: ' + error.message);
    } else {
      Alert.alert('موفق', 'کلاس به معلم اختصاص یافت.');
      setAssignModalVisible(false);
      fetchData();
    }
  };

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'مدیر ارشد',
      school_manager: 'مدیر مدرسه',
      vice_academic: 'معاون آموزشی',
      vice_cultural: 'معاون پرورشی',
      teacher: 'معلم',
      parent: 'والد',
    };
    return labels[role] || role;
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
          <Text style={styles.backText}>بازگشت به داشبورد</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>👥 مدیریت کاربران</Text>
          <Text style={styles.subtitle}>ایجاد و مدیریت حساب‌های کاربری مدرسه</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
        ) : users.length === 0 ? (
          <View style={[styles.empty, shadows.soft]}>
            <Text style={styles.emptyText}>هنوز کاربری ثبت نشده است.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {users.map((u) => {
              const assigned = teacherClasses.find(tc => tc.teacher_id === u.id);
              return (
                <View key={u.id} style={[styles.card, shadows.soft]}>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{u.full_name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.name}>{u.full_name}</Text>
                      <Text style={styles.email}>{u.email}</Text>
                      <Text style={styles.roleBadge}>{roleLabel(u.role)}</Text>
                      {u.role === 'teacher' && assigned && (
                        <Text style={styles.assignedText}>
                          کلاس: پایه {assigned.grade} - {assigned.class_name}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.actions}>
                    {u.role === 'teacher' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.info + '22' }]}
                        onPress={() => openAssignModal(u)}
                      >
                        <Text style={{ color: colors.info, fontFamily: fonts.bold, fontSize: 11 }}>
                          {assigned ? 'تغییر کلاس' : 'اختصاص کلاس'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: u.is_active ? colors.success + '22' : colors.danger + '22' }]}
                      onPress={() => handleToggleActive(u)}
                    >
                      <Text style={{ color: u.is_active ? colors.success : colors.danger, fontFamily: fonts.bold, fontSize: 11 }}>
                        {u.is_active ? 'فعال' : 'غیرفعال'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, shadows.card]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      {/* Modal ساخت کاربر */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView style={{ maxHeight: '90%' }}>
            <View style={[styles.modalContent, shadows.card]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>کاربر جدید</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>نام و نام خانوادگی</Text>
              <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="مثلاً خانم احمدی" textAlign="right" />

              <Text style={styles.label}>ایمیل</Text>
              <TextInput style={styles.input} value={newEmail} onChangeText={setNewEmail} placeholder="email@alavi-school.ir" keyboardType="email-address" autoCapitalize="none" textAlign="right" />

              <Text style={styles.label}>رمز عبور</Text>
              <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="حداقل ۶ کاراکتر" secureTextEntry textAlign="right" />

              <Text style={styles.label}>نقش کاربری</Text>
              <View style={styles.rolesRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity 
                    key={r.key} 
                    style={[styles.roleBtn, newRole === r.key && styles.roleBtnActive]}
                    onPress={() => setNewRole(r.key)}
                  >
                    <Text style={[styles.roleBtnText, newRole === r.key && { color: colors.white }]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateUser} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ساخت کاربر</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* 🌟 Modal اختصاص کلاس */}
      <Modal visible={assignModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختصاص کلاس به {selectedTeacher?.full_name}</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>پایه</Text>
            <View style={styles.rolesRow}>
              {[1,2,3,4,5,6].map(g => (
                <TouchableOpacity key={g} style={[styles.roleBtn, assignGrade===g && styles.roleBtnActive]} onPress={() => setAssignGrade(g)}>
                  <Text style={[styles.roleBtnText, assignGrade===g && { color: colors.white }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>کلاس</Text>
            <View style={styles.rolesRow}>
              {['یاس ۱','یاس ۲'].map(c => (
                <TouchableOpacity key={c} style={[styles.roleBtn, assignClass===c && styles.roleBtnActive]} onPress={() => setAssignClass(c)}>
                  <Text style={[styles.roleBtnText, assignClass===c && { color: colors.white }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAssignClass} disabled={assignSaving}>
              {assignSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ذخیره اختصاص</Text>}
            </TouchableOpacity>
          </View>
        </View>
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
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  list: { gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.secondaryDark + '22', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 20, color: colors.secondaryDark },
  name: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  email: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  roleBadge: { fontFamily: fonts.regular, fontSize: 11, color: colors.secondaryDark, marginTop: 4 },
  assignedText: { fontFamily: fonts.bold, fontSize: 11, color: colors.info, marginTop: 4 },
  actions: { flexDirection: 'row-reverse', marginTop: spacing.sm, gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },

  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, flex: 1, textAlign: 'right' },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 10, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream, marginBottom: 8 },
  rolesRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  roleBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border },
  roleBtnActive: { backgroundColor: colors.secondaryDark, borderColor: colors.secondaryDark },
  roleBtnText: { fontFamily: fonts.bold, fontSize: 12, color: colors.textLight },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});