import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthProvider';
import { colors, spacing, borderRadius, shadows, fonts } from '../../src/constants/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('توجه', 'لطفاً ایمیل و رمز عبور را وارد کنید.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('خطا', 'ایمیل یا رمز عبور صحیح نیست.');
      return;
    }

    router.replace('/admin');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.card, shadows.card]}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={40} color={colors.secondaryDark} />
        </View>
        
        <Text style={styles.title}>ورود به پنل مدیریت</Text>
        <Text style={styles.subtitle}>دبستان دخترانه علوی اسلامی</Text>

        <Text style={styles.label}>ایمیل</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="name@alavi-school.ir"
          placeholderTextColor={colors.textMuted}
          textAlign="right"
        />

        <Text style={styles.label}>رمز عبور</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          textAlign="right"
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnText}>ورود</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>بازگشت به صفحه اصلی</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.xl, maxWidth: 500, alignSelf: 'center', width: '100%' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.secondary + '22', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'center', marginBottom: spacing.xl },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, textAlign: 'right', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 12, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, marginBottom: spacing.md, backgroundColor: colors.cream },
  btn: { backgroundColor: colors.secondaryDark, borderRadius: borderRadius.pill, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm },
  btnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  backText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: spacing.lg },
});