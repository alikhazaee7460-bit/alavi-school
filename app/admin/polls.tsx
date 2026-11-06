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

export default function ManagePolls() {
  const { profile } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  const fetchPolls = async () => {
    setLoading(true);
    const { data } = await supabase.from('polls').select('*, poll_options(*)').order('created_at', { ascending: false });
    setPolls(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPolls(); }, []);

  const handleSave = async () => {
    const validOptions = options.filter(o => o.trim());
    if (!newTitle.trim() || validOptions.length < 2) {
      Alert.alert('توجه', 'عنوان و حداقل ۲ گزینه الزامی هستند.');
      return;
    }

    setSaving(true);

    // ارسال تمام فیلدهای ممکن با مقادیر پیش‌فرض
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({ 
        title: newTitle.trim(), 
        description: newDesc.trim() || null, 
        is_active: true,
        created_by: profile?.id || null,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0, 10), // ۷ روز بعد
      })
      .select('id')
      .single();

    if (pollError) {
      setSaving(false);
      Alert.alert('خطا', 'ساخت نظرسنجی انجام نشد: ' + pollError.message + ' (کد: ' + pollError.code + ')');
      return;
    }

    const optionsToInsert = validOptions.map(opt => ({ poll_id: pollData.id, option_text: opt.trim() }));
    const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);

    if (optionsError) {
      await supabase.from('polls').delete().eq('id', pollData.id);
      setSaving(false);
      Alert.alert('خطا', 'ذخیره گزینه‌ها انجام نشد.');
      return;
    }

    setSaving(false);
    Alert.alert('موفق', 'نظرسنجی ساخته شد.');
    setModalVisible(false);
    setNewTitle(''); setNewDesc(''); setOptions(['', '']);
    fetchPolls();
  };

  const handleDelete = async (id: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('آیا از حذف مطمئنید؟')) return;
    } else {
      const confirm = await new Promise(resolve => {
        Alert.alert('حذف', 'مطمئنید؟', [
          { text: 'انصراف', style: 'cancel', onPress: () => resolve(false) },
          { text: 'حذف', style: 'destructive', onPress: () => resolve(true) }
        ]);
      });
      if (!confirm) return;
    }
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (!error) fetchPolls();
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
          <Text style={styles.backText}>بازگشت</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>📊 مدیریت نظرسنجی‌ها</Text>
        </View>

        {loading ? <ActivityIndicator color={colors.primaryDark} /> : (
          <View style={styles.list}>
            {polls.map((p) => (
              <View key={p.id} style={[styles.card, shadows.soft]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  <TouchableOpacity onPress={() => handleDelete(p.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.optionsCount}>تعداد گزینه‌ها: {p.poll_options?.length || 0}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, shadows.card]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView style={{ maxHeight: '90%' }}>
            <View style={[styles.modalContent, shadows.card]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>نظرسنجی جدید</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>عنوان *</Text>
              <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="عنوان نظرسنجی" textAlign="right" />

              <Text style={styles.label}>توضیحات</Text>
              <TextInput style={styles.input} value={newDesc} onChangeText={setNewDesc} placeholder="توضیحات" textAlign="right" />

              <Text style={styles.label}>گزینه‌ها *</Text>
              {options.map((opt, i) => (
                <TextInput key={i} style={styles.input} value={opt} onChangeText={(text) => updateOption(i, text)} placeholder={`گزینه ${i + 1}`} textAlign="right" />
              ))}
              
              <TouchableOpacity style={styles.addOptionBtn} onPress={() => setOptions([...options, ''])}>
                <Ionicons name="add" size={16} color={colors.secondaryDark} />
                <Text style={styles.addOptionText}>افزودن گزینه</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ساخت نظرسنجی</Text>}
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
  list: { gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'right' },
  optionsCount: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'right' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 10, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream, marginBottom: 8 },
  addOptionBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingVertical: 8 },
  addOptionText: { fontFamily: fonts.bold, fontSize: 12, color: colors.secondaryDark },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});