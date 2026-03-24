import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet,
  Platform, TextInput, Image, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/components/screen-container';
import { AppColors, Gradients } from '@/lib/design-tokens';
import { getProfile, saveProfile, ElderProfile } from '@/lib/storage';
import { getZodiac } from '@/lib/zodiac';
import {
  areRemindersScheduled,
  scheduleAllReminders,
  cancelAllReminders,
  requestNotificationPermissions,
} from '@/lib/notifications';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ElderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [permDenied, setPermDenied] = useState(false);

  // Inline edit state
  const [editingCaregiverName, setEditingCaregiverName] = useState(false);
  const [caregiverNameDraft, setCaregiverNameDraft] = useState('');
  const [editingElderNickname, setEditingElderNickname] = useState(false);
  const [elderNicknameDraft, setElderNicknameDraft] = useState('');

  const pickPhoto = useCallback(async (target: 'caregiver' | 'elder') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setPermDenied(true);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const uri = result.assets[0].uri;
    setProfile(prev => {
      if (!prev) return prev;
      const updated = target === 'caregiver'
        ? { ...prev, caregiverPhotoUri: uri, caregiverAvatarType: 'photo' as const }
        : { ...prev, photoUri: uri, elderAvatarType: 'photo' as const };
      saveProfile(updated);
      return updated;
    });
  }, []);

  useFocusEffect(useCallback(() => {
    getProfile().then(p => {
      setProfile(p);
      setCaregiverNameDraft(p?.caregiverName || '');
      setElderNicknameDraft(p?.nickname || p?.name || '');
      setLoading(false);
    });
    if (Platform.OS !== 'web') {
      areRemindersScheduled().then(setNotifEnabled);
    }
  }, []));

  const saveCaregiverName = async () => {
    if (!profile || !caregiverNameDraft.trim()) return;
    const updated = await saveProfile({ ...profile, caregiverName: caregiverNameDraft.trim() });
    setProfile(updated);
    setEditingCaregiverName(false);
  };

  const saveElderNickname = async () => {
    if (!profile || !elderNicknameDraft.trim()) return;
    const updated = await saveProfile({ ...profile, nickname: elderNicknameDraft.trim() });
    setProfile(updated);
    setEditingElderNickname(false);
  };

  const toggleNotifications = async (value: boolean) => {
    setNotifLoading(true);
    try {
      if (value) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          await scheduleAllReminders(profile?.nickname || profile?.name || undefined);
          setNotifEnabled(true);
        } else {
          setNotifEnabled(false);
        }
      } else {
        await cancelAllReminders();
        setNotifEnabled(false);
      }
    } catch {
      // silently fail
    }
    setNotifLoading(false);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={styles.loading}>加载中...</Text>
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text style={styles.noProfile}>还没有设置个人信息</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/onboarding' as any)}>
          <Text style={styles.btnText}>前往设置</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const elderZodiac = getZodiac(new Date(profile.birthDate).getFullYear());
  const caregiverZodiac = getZodiac(parseInt(profile.caregiverBirthYear));

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ 返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>个人信息</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* ── 照顾者信息 ── */}
        <Text style={styles.sectionLabel}>👤 照顾者</Text>
        <View style={[styles.card, { backgroundColor: caregiverZodiac.bgColor }]}>
          {/* 头像区域 */}
          <TouchableOpacity style={styles.avatarWrap} onPress={() => pickPhoto('caregiver')} activeOpacity={0.8}>
            {profile.caregiverAvatarType === 'photo' && profile.caregiverPhotoUri ? (
              <Image source={{ uri: profile.caregiverPhotoUri }} style={styles.avatarPhoto} />
            ) : (
              <Text style={styles.cardEmoji}>{caregiverZodiac.emoji}</Text>
            )}
            <View style={styles.cameraChip}>
              <Text style={styles.cameraChipText}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardInfo}>
            {editingCaregiverName ? (
              <View style={styles.inlineEditRow}>
                <TextInput
                  style={styles.inlineInput}
                  value={caregiverNameDraft}
                  onChangeText={setCaregiverNameDraft}
                  autoFocus
                  placeholder="输入您的名字"
                  placeholderTextColor={AppColors.text.tertiary}
                  returnKeyType="done"
                  onSubmitEditing={saveCaregiverName}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={saveCaregiverName}>
                  <Text style={styles.saveBtnText}>保存</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                  setCaregiverNameDraft(profile.caregiverName);
                  setEditingCaregiverName(false);
                }}>
                  <Text style={{ fontSize: 16, color: AppColors.text.tertiary }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>{profile.caregiverName}</Text>
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => {
                    setCaregiverNameDraft(profile.caregiverName);
                    setEditingCaregiverName(true);
                  }}
                >
                  <Text style={{ fontSize: 13, color: AppColors.text.tertiary }}>✏️</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.cardSub}>属{caregiverZodiac.name} · {profile.caregiverBirthYear}年</Text>
            <Text style={styles.cardSub2}>照顾者</Text>
          </View>
        </View>

        {/* ── 老人信息 ── */}
        <Text style={styles.sectionLabel}>🧡 被照顾者</Text>
        <View style={[styles.card, { backgroundColor: elderZodiac.bgColor }]}>
          {/* 头像区域 */}
          <TouchableOpacity style={styles.avatarWrap} onPress={() => pickPhoto('elder')} activeOpacity={0.8}>
            {profile.elderAvatarType === 'photo' && profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatarPhoto} />
            ) : (
              <Text style={styles.cardEmoji}>{elderZodiac.emoji}</Text>
            )}
            <View style={styles.cameraChip}>
              <Text style={styles.cameraChipText}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardInfo}>
            {editingElderNickname ? (
              <View style={styles.inlineEditRow}>
                <TextInput
                  style={styles.inlineInput}
                  value={elderNicknameDraft}
                  onChangeText={setElderNicknameDraft}
                  autoFocus
                  placeholder="输入昵称（如：姥姥）"
                  placeholderTextColor={AppColors.text.tertiary}
                  returnKeyType="done"
                  onSubmitEditing={saveElderNickname}
                />
                <TouchableOpacity style={styles.saveBtn} onPress={saveElderNickname}>
                  <Text style={styles.saveBtnText}>保存</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                  setElderNicknameDraft(profile.nickname || profile.name);
                  setEditingElderNickname(false);
                }}>
                  <Text style={{ fontSize: 16, color: AppColors.text.tertiary }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>{profile.nickname || profile.name}</Text>
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => {
                    setElderNicknameDraft(profile.nickname || profile.name);
                    setEditingElderNickname(true);
                  }}
                >
                  <Text style={{ fontSize: 13, color: AppColors.text.tertiary }}>✏️</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.cardSub}>属{elderZodiac.name} · {new Date(profile.birthDate).getFullYear()}年</Text>
            <Text style={styles.cardSub2}>{profile.name}</Text>
          </View>
        </View>

        {/* 权限被拒绝提示 Modal */}
        <Modal visible={permDenied} transparent animationType="fade" onRequestClose={() => setPermDenied(false)}>
          <View style={styles.permOverlay}>
            <View style={styles.permBox}>
              <Text style={{ fontSize: 32, marginBottom: 10 }}>📷</Text>
              <Text style={styles.permTitle}>需要相册权限</Text>
              <Text style={styles.permMsg}>请前往手机「设置」→「隐私」→「照片」，允许此 App 访问相册。</Text>
              <TouchableOpacity style={styles.permBtn} onPress={() => setPermDenied(false)}>
                <Text style={styles.permBtnText}>知道了</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* City */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 所在城市</Text>
          <Text style={styles.infoValue}>{profile.city}</Text>
        </View>

        {/* Notification settings section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔔 提醒设置</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>每日打卡提醒</Text>
            <Text style={styles.settingDesc}>
              {Platform.OS === 'web' ? '仅在手机端可用' : '早上 8:00 · 晚上 21:00'}
            </Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={toggleNotifications}
            disabled={notifLoading || Platform.OS === 'web'}
            trackColor={{ false: AppColors.border.soft, true: AppColors.coral.primary }}
            thumbColor={notifEnabled ? AppColors.surface.whiteStrong : '#f4f3f4'}
          />
        </View>

        {notifEnabled && Platform.OS !== 'web' && (
          <View style={styles.notifInfo}>
            <Text style={styles.notifInfoText}>☀️ 早上 {profile.reminderMorning || '08:00'} — 记录昨晚睡眠情况</Text>
            <Text style={styles.notifInfoText}>🌙 晚上 {profile.reminderEvening || '21:00'} — 记录今日饮食和心情</Text>
          </View>
        )}

        {/* Reminder time customization */}
        <View style={styles.reminderEditCard}>
          <Text style={styles.reminderEditTitle}>⏰ 自定义提醒时间</Text>
          <View style={styles.reminderEditRow}>
            <Text style={styles.reminderEditLabel}>🌅 早上打卡</Text>
            <View style={styles.timeChipRow}>
              {['06:00', '07:00', '08:00', '09:00', '10:00'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChipSmall, (profile.reminderMorning || '08:00') === t && styles.timeChipSmallActive]}
                  onPress={async () => {
                    const updated = await saveProfile({ ...profile, reminderMorning: t });
                    setProfile(updated);
                  }}
                >
                  <Text style={[styles.timeChipSmallText, (profile.reminderMorning || '08:00') === t && styles.timeChipSmallTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[styles.reminderEditRow, { marginTop: 12 }]}>
            <Text style={styles.reminderEditLabel}>🌙 晚上打卡</Text>
            <View style={styles.timeChipRow}>
              {['19:00', '20:00', '21:00', '22:00', '23:00'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChipSmall, (profile.reminderEvening || '21:00') === t && styles.timeChipSmallActive]}
                  onPress={async () => {
                    const updated = await saveProfile({ ...profile, reminderEvening: t });
                    setProfile(updated);
                  }}
                >
                  <Text style={[styles.timeChipSmallText, (profile.reminderEvening || '21:00') === t && styles.timeChipSmallTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Edit button */}
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/onboarding' as any)}>
          <Text style={styles.editBtnText}>✏️ 重新设置所有信息</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  backBtnText: { fontSize: 16, color: AppColors.coral.primary, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: AppColors.text.primary },
  loading: { fontSize: 16, color: AppColors.text.secondary },
  noProfile: { fontSize: 18, color: AppColors.text.secondary, marginBottom: 24, textAlign: 'center' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: AppColors.text.tertiary, marginBottom: 8, letterSpacing: 0.5 },

  card: {
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 16,
  },
  avatarWrap: { position: 'relative', width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  avatarPhoto: { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.7)' },
  cameraChip: {
    position: 'absolute', bottom: -2, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: AppColors.surface.whiteStrong, alignItems: 'center', justifyContent: 'center',
    shadowColor: AppColors.shadow.dark, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  cameraChipText: { fontSize: 13 },

  cardEmoji: { fontSize: 48 },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardName: { fontSize: 20, fontWeight: '700', color: AppColors.text.primary },
  editIconBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  inlineEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  inlineInput: {
    flex: 1, fontSize: 17, fontWeight: '700', color: AppColors.text.primary,
    borderBottomWidth: 2, borderBottomColor: AppColors.coral.primary,
    paddingVertical: 2, paddingHorizontal: 0,
  },
  saveBtn: {
    backgroundColor: AppColors.coral.primary, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: AppColors.surface.whiteStrong },
  cancelBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardSub: { fontSize: 14, color: AppColors.text.secondary, marginBottom: 2 },
  cardSub2: { fontSize: 13, color: AppColors.text.tertiary },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: AppColors.bg.secondary, borderRadius: 16, padding: 16, marginBottom: 16,
  },
  infoLabel: { fontSize: 15, color: AppColors.text.secondary },
  infoValue: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary },
  sectionHeader: { marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: AppColors.text.primary },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: AppColors.bg.secondary, borderRadius: 16, padding: 16, marginBottom: 8,
  },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: AppColors.text.primary, marginBottom: 2 },
  settingDesc: { fontSize: 13, color: AppColors.text.tertiary },
  notifInfo: {
    backgroundColor: AppColors.coral.soft, borderRadius: 12, padding: 14, marginBottom: 16, gap: 6,
  },
  notifInfoText: { fontSize: 14, color: AppColors.text.secondary, lineHeight: 20 },
  editBtn: {
    backgroundColor: AppColors.coral.primary, borderRadius: 20, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  editBtnText: { fontSize: 16, fontWeight: '700', color: AppColors.surface.whiteStrong },
  btn: { backgroundColor: AppColors.coral.primary, borderRadius: 20, paddingHorizontal: 32, paddingVertical: 14 },
  btnText: { fontSize: 16, fontWeight: '700', color: AppColors.surface.whiteStrong },

  permOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  permBox: { backgroundColor: AppColors.surface.whiteStrong, borderRadius: 20, padding: 28, width: 300, alignItems: 'center' },
  permTitle: { fontSize: 17, fontWeight: '800', color: AppColors.text.primary, marginBottom: 8 },
  permMsg: { fontSize: 14, color: AppColors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  permBtn: { backgroundColor: AppColors.coral.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 },
  permBtnText: { fontSize: 15, fontWeight: '700', color: AppColors.surface.whiteStrong },

  reminderEditCard: {
    backgroundColor: AppColors.purple.soft,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.purple.primary,
  },
  reminderEditTitle: { fontSize: 15, fontWeight: '800', color: AppColors.purple.strong, marginBottom: 14 },
  reminderEditRow: { gap: 8 },
  reminderEditLabel: { fontSize: 14, fontWeight: '700', color: AppColors.text.primary, marginBottom: 6 },
  timeChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChipSmall: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: AppColors.purple.soft,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  timeChipSmallActive: {
    backgroundColor: AppColors.purple.strong,
    borderColor: AppColors.purple.strong,
  },
  timeChipSmallText: { fontSize: 13, fontWeight: '600', color: AppColors.purple.strong },
  timeChipSmallTextActive: { color: AppColors.surface.whiteStrong },
});
