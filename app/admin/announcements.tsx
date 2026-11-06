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

type Announcement = {
  id: string;
  title: string;
  body: string;
  is_school_wide: boolean;
  published_at: string;
};

export default function ManageAnnouncements() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isSchoolWide, setIsSchoolWide] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (!error && data) setAnnouncements(data as Announcement[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // 🌟 باز کردن فرم برای ایجاد جدید
  const openCreateModal = () => {
    setEditingId(null);
    setNewTitle(''); setNewBody('');
    setModalVisible(true);
  };

  // 🌟 باز کردن فرم برای ویرایش
  const openEditModal = (ann: Announcement) => {
    setEditingId(ann.id);
    setNewTitle(ann.title);
    setNewBody(ann.body);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      Alert.alert('توجه', 'لطفاً عنوان و متن اطلاعیه را وارد کنید.');
      return;
    }

    setSaving(true);

    if (editingId) {
      // ویرایش
      const { error } = await supabase.from('announcements').update({
        title: newTitle.trim(),
        body: newBody.trim(),
      }).eq('id', editingId);
      setSaving(false);
      if (error) Alert.alert('خطا', 'ویرایش انجام نشد.');
      else { Alert.alert('موفق', 'اطلاعیه ویرایش شد.'); setModalVisible(false); fetchAnnouncements(); }
    } else {
      // ایجاد
      const { error } = await supabase.from('announcements').insert({
        title: newTitle.trim(),
        body: newBody.trim(),
        is_school_wide: isSchoolWide,
        created_by: profile?.id,
        is_published: true,
      });
      setSaving(false);
      if (error) Alert.alert('خطا', 'ذخیره انجام نشد.');
      else { Alert.alert('موفق', 'اطلاعیه جدید ثبت شد.'); setModalVisible(false); fetchAnnouncements(); }
    }
  };

  // 🌟 حذف (اصلاح شده برای وب)
  const handleDelete = async (id: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('آیا از حذف این اطلاعیه مطمئنید؟')) return;
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) alert('خطا در حذف: ' + error.message);
      else fetchAnnouncements();
    } else {
      Alert.alert('حذف', 'مطمئنید؟', [
        { text: 'انصراف', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => {
          const { error } = await supabase.from('announcements').delete().eq('id', id);
          if (!error) fetchAnnouncements();
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
          <Text style={styles.title}>📢 مدیریت اطلاعیه‌ها</Text>
          <Text style={styles.subtitle}>ایجاد، ویرایش و حذف اطلاعیه‌ها</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
        ) : announcements.length === 0 ? (
          <View style={[styles.empty, shadows.soft]}>
            <Text style={styles.emptyText}>هنوز اطلاعیه‌ای ثبت نشده است.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {announcements.map((ann) => (
              <View key={ann.id} style={[styles.card, shadows.soft]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.dateText}>
                    {new Date(ann.published_at).toLocaleDateString('fa-IR')}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEditModal(ann)} style={styles.actionBtn}>
                      <Ionicons name="pencil" size={18} color={colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(ann.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{ann.title}</Text>
                <Text style={styles.cardBody}>{ann.body}</Text>
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
          <View style={[styles.modalContent, shadows.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'ویرایش اطلاعیه' : 'اطلاعیه جدید'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>عنوان اطلاعیه</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="عنوان را وارد کنید..."
              textAlign="right"
            />

            <Text style={styles.label}>متن اطلاعیه</Text>
            <TextInput
              style={[styles.input, { height: 120 }]}
              value={newBody}
              onChangeText={setNewBody}
              placeholder="متن را وارد کنید..."
              multiline
              textAlign="right"
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>{editingId ? 'ذخیره تغییرات' : 'انتشار اطلاعیه'}</Text>}
            </TouchableOpacity>
          </View>
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
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  list: { gap: 14 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  actions: { flexDirection: 'row-reverse', gap: 12 },
  actionBtn: { padding: 4 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'right', marginBottom: 4 },
  cardBody: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'right', lineHeight: 22 },
  
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 12, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});