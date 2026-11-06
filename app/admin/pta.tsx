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

export default function ManagePTA() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pta_posts')
      .select('*')
      .order('published_at', { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setNewTitle(''); setNewBody('');
    setModalVisible(true);
  };

  const openEditModal = (post: any) => {
    setEditingId(post.id);
    setNewTitle(post.title);
    setNewBody(post.body);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      Alert.alert('توجه', 'عنوان و متن الزامی هستند.');
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from('pta_posts').update({
        title: newTitle.trim(),
        body: newBody.trim(),
      }).eq('id', editingId);
      
      if (error) Alert.alert('خطا', 'ویرایش انجام نشد.');
      else { Alert.alert('موفق', 'خبر ویرایش شد.'); setModalVisible(false); fetchPosts(); }
    } else {
      const { error } = await supabase.from('pta_posts').insert({
        title: newTitle.trim(),
        body: newBody.trim(),
        created_by: profile?.id,
        is_published: true,
      });
      
      if (error) Alert.alert('خطا', 'ذخیره انجام نشد.');
      else { Alert.alert('موفق', 'خبر جدید ثبت شد.'); setModalVisible(false); fetchPosts(); }
    }
    
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('آیا از حذف مطمئنید؟')) return;
      await supabase.from('pta_posts').delete().eq('id', id);
      fetchPosts();
    } else {
      Alert.alert('حذف', 'مطمئنید؟', [
        { text: 'انصراف', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => {
          await supabase.from('pta_posts').delete().eq('id', id);
          fetchPosts();
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
          <Text style={styles.title}>👩‍👩‍👧 مدیریت انجمن اولیا</Text>
          <Text style={styles.subtitle}>ثبت و مدیریت اخبار انجمن</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
        ) : posts.length === 0 ? (
          <View style={[styles.empty, shadows.soft]}>
            <Text style={styles.emptyText}>هنوز خبری ثبت نشده است.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {posts.map((p) => (
              <View key={p.id} style={[styles.card, shadows.soft]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.dateText}>{new Date(p.published_at).toLocaleDateString('fa-IR')}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(p)}>
                      <Ionicons name="pencil" size={18} color={colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(p.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.postTitle}>{p.title}</Text>
                <Text style={styles.postBody} numberOfLines={3}>{p.body}</Text>
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
              <Text style={styles.modalTitle}>{editingId ? 'ویرایش خبر' : 'خبر جدید'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>عنوان *</Text>
            <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="عنوان خبر" textAlign="right" />

            <Text style={styles.label}>متن خبر *</Text>
            <TextInput style={[styles.input, { height: 140 }]} value={newBody} onChangeText={setNewBody} placeholder="متن خبر..." multiline textAlign="right" textAlignVertical="top" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ذخیره</Text>}
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
  
  list: { gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  actions: { flexDirection: 'row-reverse', gap: 12 },
  actionBtn: { padding: 4 },
  postTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'right', marginBottom: 4 },
  postBody: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'right', lineHeight: 20 },
  
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 10, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream, marginBottom: 8 },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});