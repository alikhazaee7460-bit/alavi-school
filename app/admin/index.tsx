import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthProvider';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

export default function AdminDashboard() {
  const { profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondaryDark} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={60} color={colors.danger} />
        <Text style={styles.deniedText}>لطفاً ابتدا وارد حساب کاربری خود شوید.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.btnText}>ورود به سامانه</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allowedRoles = ['super_admin', 'school_manager', 'vice_academic', 'vice_cultural', 'teacher'];
  if (!allowedRoles.includes(profile.role)) {
    return (
      <View style={styles.center}>
        <Ionicons name="close-circle" size={60} color={colors.danger} />
        <Text style={styles.deniedText}>شما به این بخش دسترسی ندارید.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.btnText}>ورود با حساب دیگر</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allCards = [
    { key: 'announcements', title: 'مدیریت اطلاعیه‌ها', icon: 'megaphone', roles: ['super_admin', 'school_manager', 'vice_cultural'] },
    { key: 'calendar', title: 'تقویم اجرایی', icon: 'calendar', roles: ['super_admin', 'school_manager', 'vice_academic'] },
    { key: 'schedule', title: 'برنامه هفتگی', icon: 'time', roles: ['super_admin', 'school_manager', 'vice_academic'] },
    { key: 'homework', title: 'مدیریت تکالیف', icon: 'book', roles: ['super_admin', 'school_manager', 'teacher'] },
    { key: 'messages', title: 'پیام‌ها', icon: 'mail', roles: ['super_admin', 'school_manager'] },
    { key: 'feedback', title: 'انتقادات و پیشنهادات', icon: 'chatbubbles', roles: ['super_admin', 'school_manager'] },
    { key: 'polls', title: 'نظرسنجی‌ها', icon: 'bar-chart', roles: ['super_admin', 'school_manager', 'vice_cultural'] },
    { key: 'gallery', title: 'گالری تصاویر', icon: 'images', roles: ['super_admin', 'school_manager', 'vice_cultural'] },
    { key: 'pta', title: 'انجمن اولیا', icon: 'people', roles: ['super_admin', 'school_manager', 'vice_cultural'] },
    { key: 'users', title: 'مدیریت کاربران', icon: 'person-add', roles: ['super_admin', 'school_manager'] },
    { key: 'settings', title: 'تنظیمات سیستم', icon: 'settings', roles: ['super_admin'] },
  ];

  const visibleCards = allCards.filter(card => card.roles.includes(profile.role));

  const handleCardPress = (key: string, title: string) => {
    switch (key) {
      case 'announcements':
        router.push('/admin/announcements');
        break;
      case 'users':
        router.push('/admin/users');
        break;
      case 'calendar':
        router.push('/admin/calendar');
        break;
      case 'schedule':
        router.push('/admin/schedule');
        break;
      case 'homework':
        router.push('/admin/homework');
        break;
      case 'gallery':
        router.push('/admin/gallery');
        break;
      case 'polls':
        router.push('/admin/polls');
        break;
      case 'messages':
        router.push('/admin/messages');
        break;
      case 'pta':
        router.push('/admin/pta');
        break;
      case 'settings':
        router.push('/admin/settings');
        break;
      default:
        alert(`بخش ${title} به‌زودی ساخته می‌شود.`);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.header, shadows.card]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.welcome}>خوش آمدید،</Text>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.role}>{roleLabel(profile.role)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>دسترسی‌های شما</Text>
      
      <View style={styles.grid}>
        {visibleCards.map((card) => (
          <TouchableOpacity
            key={card.key}
            style={[styles.card, shadows.soft]}
            onPress={() => handleCardPress(card.key, card.title)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={card.icon as any} size={26} color={colors.secondaryDark} />
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: 'مدیر ارشد',
    school_manager: 'مدیر مدرسه',
    vice_academic: 'معاون آموزشی',
    vice_cultural: 'معاون اجرایی و پرورشی',
    teacher: 'معلم',
  };
  return labels[role] || role;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, maxWidth: 800, alignSelf: 'center', width: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  deniedText: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, textAlign: 'center', marginTop: spacing.md },
  header: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.xl, borderRightWidth: 5, borderRightColor: colors.secondaryDark },
  headerTop: { flexDirection: 'row-reverse', alignItems: 'center' },
  logoutBtn: { padding: 8 },
  welcome: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight },
  name: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, marginTop: 2 },
  role: { fontFamily: fonts.regular, fontSize: 12, color: colors.secondaryDark, marginTop: 4 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: spacing.md, textAlign: 'right' },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' },
  card: { width: '48%', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.secondary + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, textAlign: 'center' },
  btn: { backgroundColor: colors.secondaryDark, paddingHorizontal: 24, paddingVertical: 12, borderRadius: borderRadius.pill, marginTop: spacing.lg },
  btnText: { fontFamily: fonts.bold, color: colors.white },
});