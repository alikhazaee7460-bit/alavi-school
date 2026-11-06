import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, borderRadius, shadows, fonts } from '../src/constants/theme';

export default function PollsScreen() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  // 🌟 State های مربوط به Modal رأی دادن
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const fetchPolls = async () => {
    setLoading(true);
    
    const { data: pollsData } = await supabase
      .from('polls')
      .select('*, poll_options(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!pollsData) {
      setLoading(false);
      return;
    }

    const { data: votesData } = await supabase.from('poll_votes').select('*');

    const processedPolls = pollsData.map((p: any) => {
      const pollVotes = votesData?.filter(v => v.poll_id === p.id) || [];
      
      const results: { [optionId: string]: number } = {};
      p.poll_options.forEach((opt: any) => { results[opt.id] = 0; });
      pollVotes.forEach(v => { if (results[v.option_id] !== undefined) results[v.option_id]++; });

      return { 
        ...p, 
        total_votes: pollVotes.length,
        results 
      };
    });

    setPolls(processedPolls);
    setLoading(false);
  };

  useEffect(() => { fetchPolls(); }, []);

  // 🌟 باز کردن Modal برای رأی دادن
  const openVoteModal = (pollId: string, optionId: string) => {
    setSelectedPollId(pollId);
    setSelectedOptionId(optionId);
    setPhoneNumber('');
    setModalVisible(true);
  };

  // 🌟 ثبت نهایی رأی
  const submitVote = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 11) {
      Alert.alert('توجه', 'لطفاً شماره موبایل ۱۱ رقمی خود را وارد کنید.');
      return;
    }

    if (!selectedPollId || !selectedOptionId) return;

    setVoting(true);

    const { error } = await supabase.from('poll_votes').insert({
      poll_id: selectedPollId,
      option_id: selectedOptionId,
      phone_number: phoneNumber.trim(),
    });

    setVoting(false);
    
    if (error) {
      if (error.code === '23505') { // خطای تکراری بودن
        Alert.alert('خطا', 'شما قبلاً در این نظرسنجی رأی داده‌اید.');
      } else {
        Alert.alert('خطا', 'رأی شما ثبت نشد: ' + error.message);
      }
    } else {
      Alert.alert('موفق', 'رأی شما با موفقیت ثبت شد.');
      setModalVisible(false);
      fetchPolls();
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.secondaryDark} />
          <Text style={styles.backText}>بازگشت به خانه</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>📊 نظرسنجی‌ها</Text>
          <Text style={styles.subtitle}>برای رأی دادن، روی گزینه مورد نظر کلیک کنید</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryDark} style={{ marginVertical: 40 }} />
        ) : polls.length === 0 ? (
          <View style={[styles.empty, shadows.soft]}>
            <Text style={styles.emptyText}>هنوز نظرسنجی فعالی وجود ندارد.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {polls.map((poll) => (
              <View key={poll.id} style={[styles.card, shadows.card]}>
                <Text style={styles.pollTitle}>{poll.title}</Text>
                {poll.description && <Text style={styles.pollDesc}>{poll.description}</Text>}
                
                <View style={styles.optionsContainer}>
                  {poll.poll_options.map((opt: any) => {
                    const votesCount = poll.results?.[opt.id] || 0;
                    const percent = poll.total_votes ? Math.round((votesCount / poll.total_votes) * 100) : 0;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={styles.optionBtn}
                        onPress={() => openVoteModal(poll.id, opt.id)}
                      >
                        <View style={styles.optionInfo}>
                          <Text style={styles.optionText}>{opt.option_text}</Text>
                          <Text style={styles.voteCount}>{votesCount} رأی</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.totalVotes}>مجموع آرا: {poll.total_votes}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 🌟 Modal ثبت شماره موبایل */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.card]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ثبت رأی</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalGuide}>
              برای ثبت رأی، لطفاً شماره موبایل خود را وارد کنید. (هر شماره فقط یک بار می‌تواند رأی دهد)
            </Text>

            <Text style={styles.label}>شماره موبایل *</Text>
            <TextInput 
              style={styles.input} 
              value={phoneNumber} 
              onChangeText={setPhoneNumber} 
              placeholder="09123456789" 
              keyboardType="phone-pad"
              maxLength={11}
              textAlign="right"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={submitVote} disabled={voting}>
              {voting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>ثبت رأی</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  backBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { fontFamily: fonts.bold, fontSize: 14, color: colors.secondaryDark },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.text, marginBottom: 6 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'center' },
  
  list: { gap: 16 },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  pollTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text, textAlign: 'right', marginBottom: 6 },
  pollDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, textAlign: 'right', marginBottom: 16 },
  
  optionsContainer: { gap: 10 },
  optionBtn: { backgroundColor: colors.cream, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  optionInfo: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  voteCount: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  
  progressBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.secondaryDark },
  
  totalVotes: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 12, textAlign: 'left' },
  
  empty: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },

  // 🌟 استایل‌های Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  modalGuide: { fontFamily: fonts.regular, fontSize: 12, color: colors.textLight, textAlign: 'right', marginBottom: spacing.lg, lineHeight: 20 },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 12, fontFamily: fonts.regular, fontSize: 16, color: colors.text, backgroundColor: colors.cream, marginBottom: spacing.md, textAlign: 'center' },
  saveBtn: { backgroundColor: colors.secondaryDark, paddingVertical: 14, borderRadius: borderRadius.pill, alignItems: 'center' },
  saveBtnText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
});