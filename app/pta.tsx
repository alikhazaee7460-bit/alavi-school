import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

export default function PTAScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('pta_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      setPosts(data ?? []);
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
        <View style={styles.iconCircle}>
          <Ionicons name="people" size={32} color={colors.secondaryDark} />
        </View>
        <Text style={styles.title}>👩‍👩‍👧 انجمن اولیا و مربیان</Text>
        <Text style={styles.subtitle}>اخبار و اطلاعیه‌های انجمن</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
      ) : posts.length === 0 ? (
        <View style={[styles.empty, shadows.soft]}>
          <Ionicons name="people-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>هنوز خبری از انجمن ثبت نشده است.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {posts.map((p) => (
            <View key={p.id} style={[styles.card, shadows.card]}>
              <Text style={styles.dateText}>
                {new Date(p.published_at).toLocaleDateString('fa-IR')}
              </Text>
              <Text style={styles.postTitle}>{p.title}</Text>
              <Text style={styles.postBody}>{p.body}</Text>
            </View>
          ))}
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
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.secondary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  
  list: { gap: 16 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg, borderRightWidth: 5, borderRightColor: colors.accent },
  dateText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right', marginBottom: 8 },
  postTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text, textAlign: 'right', marginBottom: 8 },
  postBody: { fontFamily: fonts.regular, fontSize: 14, color: colors.textLight, textAlign: 'right', lineHeight: 24 },
  
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});