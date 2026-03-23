import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Easing, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  createFamilyRoom, getProfile, saveProfile, generateId,
  addOrUpdateMembership, setActiveFamilyId, FamilyMembership,
} from '@/lib/storage';
import { useFamilyContext } from '@/lib/family-context';
import { COLORS, SHADOWS, RADIUS } from '@/lib/animations';
import * as Haptics from 'expo-haptics';

const ELDER_EMOJIS = ['👵', '👴', '🧓', '👩', '👨', '🌸', '🌟', '🍀', '🐉', '🦁'];
const MY_EMOJIS = ['👩', '👨', '👧', '👦', '🧑', '👩‍⚕️', '👨‍⚕️', '🧑‍🤝‍🧑'];
const ROLES = [
  { role: 'caregiver' as const, label: '主要照顾者', desc: '负责日常护理记录' },
  { role: 'family' as const, label: '家庭成员', desc: '关注家人动态' },
  { role: 'nurse' as const, label: '护理人员', desc: '专业护理支持' },
];
const RELATIONSHIPS = ['女儿', '儿子', '孙女', '孙子', '外孙女', '外孙', '媳妇', '女婿', '兄弟姐妹', '护理员', '其他'];
const MEMBER_COLORS = ['#6C9E6C', '#E07B4A', '#7B7EC8', '#E07B9A', '#4A9EC8', '#C89A4A'];

export default function CreateFamilyModal() {
  const insets = useSafeAreaInsets();
  const { refresh } = useFamilyContext();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Elder info
  const [elderName, setElderName] = useState('');
  const [elderEmoji, setElderEmoji] = useState('👵');

  // My info
  const [myName, setMyName] = useState('');
  const [myRole, setMyRole] = useState<'caregiver' | 'family' | 'nurse'>('caregiver');
  const [myRoleLabel, setMyRoleLabel] = useState('主要照顾者');
  const [myEmoji, setMyEmoji] = useState('👩');
  const [myRelationship, setMyRelationship] = useState('');
  const [myColor, setMyColor] = useState(MEMBER_COLORS[0]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pre-fill name from existing profile
    getProfile().then(p => {
      if (p?.caregiverName) setMyName(p.caregiverName);
    });
  }, []);

  function animateNext() {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(s => s + 1);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  }

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const room = await createFamilyRoom(elderName.trim(), {
        name: myName.trim() || '我',
        role: myRole,
        roleLabel: myRelationship || myRoleLabel,
        emoji: myEmoji,
        color: myColor,
        isCreator: true,
        isCurrentUser: true,
      });
      // Refresh family context
      await refresh();
      // Navigate back to home
      if (router.canDismiss()) router.dismiss();
      else router.replace('/(tabs)/' as any);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const canGoNext0 = elderName.trim().length >= 1;
  const canGoNext1 = myName.trim().length >= 1 && myRelationship.length > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#FFF7ED', '#FDF2F8', '#FAF5FF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕ 取消</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>创建新家庭</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {[0, 1].map(i => (
          <View key={i} style={[styles.stepDot, i <= step && styles.stepDotActive]} />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && (
            <View>
              <Text style={styles.stepLabel}>Step 1</Text>
              <Text style={styles.stepTitle}>被照顾者是谁？</Text>
              <Text style={styles.stepDesc}>您将为哪位家人创建护理档案？</Text>

              <Text style={styles.fieldLabel}>他 / 她的称呼</Text>
              <TextInput
                style={styles.input}
                placeholder="例如：奶奶、外公、妈妈…"
                value={elderName}
                onChangeText={setElderName}
                placeholderTextColor="#B0B8C1"
                maxLength={20}
                autoFocus
              />

              <Text style={styles.fieldLabel}>头像</Text>
              <View style={styles.emojiRow}>
                {ELDER_EMOJIS.map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiBtn, elderEmoji === e && styles.emojiBtnActive]}
                    onPress={() => setElderEmoji(e)}
                  >
                    <Text style={{ fontSize: 26 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.stepLabel}>Step 2</Text>
              <Text style={styles.stepTitle}>您是谁？</Text>
              <Text style={styles.stepDesc}>告诉我们您与{elderName}的关系</Text>

              <Text style={styles.fieldLabel}>您的名字</Text>
              <TextInput
                style={styles.input}
                placeholder="您的名字"
                value={myName}
                onChangeText={setMyName}
                placeholderTextColor="#B0B8C1"
                maxLength={20}
                autoFocus
              />

              <Text style={styles.fieldLabel}>与{elderName}的关系</Text>
              <View style={styles.tagGrid}>
                {RELATIONSHIPS.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.tag, myRelationship === r && styles.tagActive]}
                    onPress={() => setMyRelationship(r)}
                  >
                    <Text style={[styles.tagText, myRelationship === r && styles.tagTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>身份</Text>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.role}
                  style={[styles.roleCard, myRole === r.role && styles.roleCardActive]}
                  onPress={() => { setMyRole(r.role); setMyRoleLabel(r.label); }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleTitle, myRole === r.role && { color: COLORS.primary }]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                  <View style={[styles.radioOuter, myRole === r.role && { borderColor: COLORS.primary }]}>
                    {myRole === r.role && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}

              <Text style={styles.fieldLabel}>头像颜色</Text>
              <View style={styles.colorRow}>
                {MEMBER_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorBtn, { backgroundColor: c }, myColor === c && styles.colorBtnActive]}
                    onPress={() => setMyColor(c)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Action button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {step === 0 && (
          <TouchableOpacity
            style={[styles.nextBtn, !canGoNext0 && styles.nextBtnDisabled]}
            onPress={() => canGoNext0 && animateNext()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canGoNext0 ? ['#FF8904', '#FF637E', '#F6339A'] : ['#E5E7EB', '#E5E7EB']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.nextBtnGradient}
            >
              <Text style={[styles.nextBtnText, !canGoNext0 && { color: '#9CA3AF' }]}>继续 →</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {step === 1 && (
          <TouchableOpacity
            style={[styles.nextBtn, (!canGoNext1 || saving) && styles.nextBtnDisabled]}
            onPress={handleFinish}
            activeOpacity={0.85}
            disabled={!canGoNext1 || saving}
          >
            <LinearGradient
              colors={canGoNext1 ? ['#FF8904', '#FF637E', '#F6339A'] : ['#E5E7EB', '#E5E7EB']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.nextBtnGradient}
            >
              <Text style={[styles.nextBtnText, !canGoNext1 && { color: '#9CA3AF' }]}>
                {saving ? '创建中…' : '✨ 创建家庭档案'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  closeBtn: { paddingVertical: 6, paddingRight: 8 },
  closeText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  topTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.3 },

  stepRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  stepDot: { width: 24, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  stepDotActive: { backgroundColor: '#FF8904' },

  content: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },

  stepLabel: { fontSize: 11, fontWeight: '700', color: '#FF8904', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  stepTitle: { fontSize: 26, fontWeight: '900', color: '#1A1A2E', marginBottom: 6, letterSpacing: -0.5 },
  stepDesc: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 20 },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 16, letterSpacing: 0.3 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#1A1A2E', borderWidth: 1.5, borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },

  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emojiBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  emojiBtnActive: { borderColor: '#FF8904', backgroundColor: '#FFF7ED' },

  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  tagActive: { backgroundColor: '#FFF7ED', borderColor: '#FF8904' },
  tagText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  tagTextActive: { color: '#FF8904', fontWeight: '700' },

  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#E5E7EB', ...SHADOWS.sm },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: '#F0FFF0' },
  roleTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  roleDesc: { fontSize: 12, color: '#6B7280' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  colorRow: { flexDirection: 'row', gap: 10 },
  colorBtn: { width: 32, height: 32, borderRadius: 16 },
  colorBtnActive: { borderWidth: 3, borderColor: '#FFFFFF', ...SHADOWS.md },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  nextBtn: { borderRadius: 16, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
});
