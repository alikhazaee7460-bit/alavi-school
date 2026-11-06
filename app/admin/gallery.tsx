import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  description: string | null;
};

export default function ManageGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('gallery_items').select('*').order('published_at', { ascending: false });
    setItems((data as GalleryItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const pickImage = async () => {
    // درخواست دسترسی
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('خطا', 'برای انتخاب عکس به دسترسی نیاز است.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleSave = async () => {
    if (!newTitle.trim() || !imageBase64) {
      Alert.alert('توجه', 'عنوان و عکس الزامی هستند.');
      return;
    }

    setSaving(true);
    const fileName = `gallery-${Date.now()}.jpg`;

    // ۱. آپلود عکس در Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, decode(imageBase64), { contentType: 'image/jpeg' });

    if (uploadError) {
      setSaving(false);
      Alert.alert('خطا', 'آپلود عکس انجام نشد: ' + uploadError.message);
      return;
    }

    // ۲. گرفتن لینک عمومی عکس
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);

    // ۳. ذخیره در جدول gallery_items
    const { error: dbError } = await supabase.from('gallery_items').insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      image_url: urlData.publicUrl,
    });

    setSaving(false);
    
    if (dbError) {
      Alert.alert('خطا', 'ذخیره در دیتابیس انجام نشد.');
    } else {
      Alert.alert('موفق', 'تصویر به گالری اضافه شد.');
      setModalVisible(false);
      setNewTitle(''); setNewDesc(''); setImageUri(null); setImageBase64(null);
      fetchItems();
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('آیا از حذف این تصویر مطمئنید؟')) return;
    } else {
      const confirm = await new Promise(resolve => {
        Alert.alert('حذف', 'آیا مطمئنید؟', [
          { text: 'انصراف', style: 'cancel', onPress: () => resolve(false) },
          { text: 'حذف', style: 'destructive', onPress: () => resolve(true) }
        ]);
      });
      if (!confirm) return;
    }

    // پیدا کردن نام فایل از URL و حذف از Storage
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('gallery').remove([fileName]);
    }

    // حذف از دیتابیس
    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    if (!error) fetchItems();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
          <Text style={styles.backText}>بازگشت به داشبورد</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>🖼️ مدیریت گالری</Text>
          <Text style={styles.subtitle}>افزودن و حذف تصاویر مدرسه</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
        ) : items.length === 0 ? (
          <View style={[styles.empty, shadows.soft]}>
            <Text style={styles.emptyText}>هنوز تصویری ثبت نشده است.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map((item) => (
              <View key={item.id} style={[styles.card, shadows.soft]}>
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <View style={styles.cardBody}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.image_url)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, shadows.card]} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تصویر جدید</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <>
                  <Ionicons name="camera" size={32} color={colors.secondaryDark} />
                  <Text style={styles.pickerText}>انتخاب تصویر از گالری</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>عنوان تصویر *</Text>
            <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="مثلاً جشن قرآن" textAlign="right" />

            <Text style={styles.label}>توضیحات</Text>
            <TextInput style={styles.input} value={newDesc} onChangeText={setNewDesc} placeholder="توضیحات..." textAlign="right" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>آپلود و ذخیره</Text>}
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
  
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: colors.white, borderRadius: borderRadius.lg, overflow: 'hidden' },
  image: { width: '100%', height: 120 },
  cardBody: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: spacing.sm },
  itemTitle: { fontFamily: fonts.bold, fontSize: 12, color: colors.text, flex: 1, textAlign: 'right' },
  deleteBtn: { padding: 4 },
  
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  
  imagePicker: { width: '100%', height: 150, borderRadius: borderRadius.lg, backgroundColor: colors.cream, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  pickerText: { fontFamily: fonts.bold, fontSize: 13, color: colors.secondaryDark, marginTop: 8 },
  
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, marginTop: 10, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, backgroundColor: colors.cream },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});