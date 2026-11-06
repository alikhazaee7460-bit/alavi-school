import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  description: string | null;
  published_at: string;
};

export default function GalleryScreen() {
  const { width } = useWindowDimensions();
  const numCols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('gallery_items')
        .select('*')
        .order('published_at', { ascending: false });
      
      setItems((data as GalleryItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
        <Text style={styles.backText}>بازگشت به خانه</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🖼️ گالری تصاویر</Text>
        <Text style={styles.subtitle}>تصاویر برنامه‌ها و فعالیت‌های مدرسه</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
      ) : items.length === 0 ? (
        <View style={[styles.empty, shadows.soft]}>
          <Ionicons name="images-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>هنوز تصویری در گالری ثبت نشده است.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={[styles.card, { width: `${(100 / numCols) - 2}%` }, shadows.card]}>
              <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                {item.description && <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>}
              </View>
            </View>
          ))}
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
  
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.xl, overflow: 'hidden' },
  image: { width: '100%', height: 150 },
  textContainer: { padding: spacing.sm },
  itemTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, textAlign: 'right' },
  itemDesc: { fontFamily: fonts.regular, fontSize: 11, color: colors.textLight, textAlign: 'right', marginTop: 4 },
  
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});