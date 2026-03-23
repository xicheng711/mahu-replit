import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Easing, Modal, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  getProfile, getAllCheckIns, getDiaryEntries, getFamilyAnnouncements,
  getCurrentMember,
  saveFamilyAnnouncement,
  DailyCheckIn, DiaryEntry, FamilyAnnouncement, FamilyMember,
} from '@/lib/storage';
import { getLunarDate, getFormattedDate } from '@/lib/lunar';
import { SHADOWS } from '@/lib/animations';
import { useFamilyContext } from '@/lib/family-context';

// ─── Feed item type ───────────────────────────────────────────────────────────
type FeedItem = {
  id: string;
  type: 'checkin' | 'diary' | 'announce' | 'med';
  time: string;
  icon: string;
  color: string;
  bg: string;
  tag: string;
  title: string;
  detail: string;
  author: string | null;
  sortKey: number;
};

function timeStr(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function buildFeed(
  checkIns: DailyCheckIn[],
  diaries: DiaryEntry[],
  announcements: FamilyAnnouncement[],
  caregiverName: string,
): FeedItem[] {
  const items: FeedItem[] = [];

  // Latest check-in morning
  const latest = checkIns[0];
  if (latest) {
    if (latest.morningDone) {
      items.push({
        id: `ci-m-${latest.id}`, type: 'checkin',
        time: latest.completedAt ? timeStr(latest.completedAt) : '早间',
        icon: '✅', color: '#10B981', bg: '#ECFDF5', tag: '早间打卡',
        title: '今日早间打卡完成',
        detail: `心情 ${latest.caregiverMoodEmoji || '😊'} · 睡眠 ${latest.sleepHours}h · ${latest.medicationTaken ? '用药已服' : '用药待记录'}`,
        author: null,
        sortKey: latest.completedAt ? new Date(latest.completedAt).getTime() : Date.now() - 3600000,
      });
    }
    if (latest.eveningDone) {
      items.push({
        id: `ci-e-${latest.id}`, type: 'checkin',
        time: latest.completedAt ? timeStr(latest.completedAt) : '晚间',
        icon: '🌙', color: '#8B5CF6', bg: '#F5F3FF', tag: '晚间打卡',
        title: `今日护理完成${latest.careScore ? ` ⭐ ${latest.careScore}分` : ''}`,
        detail: `心情 ${latest.moodEmoji || '😴'} · ${latest.medicationTaken ? '用药已服' : '用药未记录'} · ${latest.mealOption || latest.mealNotes || '饮食正常'}`,
        author: null,
        sortKey: latest.completedAt ? new Date(latest.completedAt).getTime() : Date.now() - 1800000,
      });
    }
  }

  // Diary entries (top 3)
  diaries.slice(0, 3).forEach(d => {
    items.push({
      id: `diary-${d.id}`, type: 'diary',
      time: d.createdAt ? timeStr(d.createdAt) : d.date,
      icon: '📔', color: '#F59E0B', bg: '#FFFBEB', tag: '护理日记',
      title: d.content.length > 20 ? d.content.slice(0, 20) + '…' : d.content,
      detail: d.tags && d.tags.length ? d.tags.slice(0, 3).join(' · ') : `${d.moodEmoji || '😊'} ${d.moodLabel || ''}`,
      author: caregiverName || '照顾者',
      sortKey: d.createdAt ? new Date(d.createdAt).getTime() : new Date(d.date).getTime(),
    });
  });

  // Announcements (top 3)
  announcements.slice(0, 3).forEach(a => {
    items.push({
      id: `ann-${a.id}`, type: 'announce',
      time: timeStr(a.createdAt),
      icon: '📢', color: '#0EA5E9', bg: '#EFF6FF', tag: '家庭公告',
      title: a.content.length > 24 ? a.content.slice(0, 24) + '…' : a.content,
      detail: a.emoji ? `${a.emoji} ${a.content}` : a.content,
      author: a.authorName,
      sortKey: new Date(a.createdAt).getTime(),
    });
  });

  return items.sort((a, b) => a.sortKey - b.sortKey);
}

// ElderStatusCard is now rendered inline in JoinerHomeScreen for richer layout

// ─── Announcement card ────────────────────────────────────────────────────────
function AnnouncementCard({ latest, onPost, onViewAll }: {
  latest: FamilyAnnouncement | null;
  onPost: () => void;
  onViewAll: () => void;
}) {
  return (
    <View style={styles.announceCard}>
      <View style={styles.announceHeader}>
        <View style={styles.announceHeaderLeft}>
          <Text style={styles.announceHeaderIcon}>📢</Text>
          <Text style={styles.announceHeaderTitle}>家庭公告</Text>
        </View>
        <TouchableOpacity style={styles.postBtn} onPress={onPost} activeOpacity={0.8}>
          <Text style={styles.postBtnText}>＋ 发布公告</Text>
        </TouchableOpacity>
      </View>
      {latest ? (
        <View style={styles.announceContent}>
          <Text style={styles.announceText} numberOfLines={2}>{latest.content}</Text>
          <View style={styles.announceFooter}>
            <Text style={styles.announceAuthorEmoji}>{latest.authorEmoji}</Text>
            <Text style={styles.announceAuthorName}>{latest.authorName}</Text>
            <Text style={styles.announceTime}> · {timeStr(latest.createdAt)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.announceEmpty}>
          <Text style={styles.announceEmptyText}>暂无公告，发布第一条家庭公告吧</Text>
        </View>
      )}
      <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll} activeOpacity={0.8}>
        <Text style={styles.viewAllBtnText}>查看全部公告 →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Feed row ─────────────────────────────────────────────────────────────────
function FeedRow({ item, isLast }: { item: FeedItem; isLast: boolean }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.feedRow, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={styles.feedTimeline}>
        <View style={[styles.feedDot, { backgroundColor: item.bg, borderColor: item.color + '40' }]}>
          <Text style={{ fontSize: 13, lineHeight: 16 }}>{item.icon}</Text>
        </View>
        {!isLast && <View style={styles.feedLine} />}
      </View>
      <View style={styles.feedContent}>
        <View style={styles.feedTagRow}>
          <View style={[styles.feedTag, { backgroundColor: item.bg }]}>
            <Text style={[styles.feedTagText, { color: item.color }]}>{item.tag}</Text>
          </View>
          {item.author && (
            <View style={styles.feedAuthorRow}>
              <Text style={styles.feedAuthorIcon}>👤</Text>
              <Text style={styles.feedAuthorName}>{item.author}</Text>
            </View>
          )}
          <Text style={styles.feedTime}>{item.time}</Text>
        </View>
        <Text style={styles.feedTitle}>{item.title}</Text>
        <Text style={styles.feedDetail}>{item.detail}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Upgrade inline card ──────────────────────────────────────────────────────
function UpgradeCard({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.upgradeCard}>
      <Text style={styles.upgradeSectionLabel}>🔒 更多记录功能</Text>
      <View style={styles.upgradeIconRow}>
        {[{ e: '✨', l: '打卡' }, { e: '💊', l: '用药' }, { e: '📔', l: '日记' }].map(t => (
          <View key={t.l} style={styles.upgradeIconItem}>
            <View style={styles.upgradeIconBox}>
              <Text style={{ fontSize: 22, opacity: 0.35 }}>{t.e}</Text>
            </View>
            <Text style={styles.upgradeIconLabel}>{t.l}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.upgradeDesc}>打卡、用药、日记是主要照顾者的专属功能。{'\n'}创建自己的家庭档案，即可解锁完整记录能力。</Text>
      <TouchableOpacity style={styles.upgradeBtn} onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.upgradeBtnGradient}
        >
          <Text style={styles.upgradeBtnText}>＋ 创建我的家庭档案</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Post Announcement Modal ──────────────────────────────────────────────────
const ANNOUNCE_TYPES = [
  { key: 'news',     label: '📢 通知', emoji: '📢' },
  { key: 'medical',  label: '🏥 就医', emoji: '🏥' },
  { key: 'reminder', label: '⏰ 提醒', emoji: '⏰' },
  { key: 'daily',    label: '🌿 日常', emoji: '🌿' },
] as const;

function PostAnnouncementModal({ visible, onClose, onPosted, member }: {
  visible: boolean;
  onClose: () => void;
  onPosted: () => void;
  member: FamilyMember | null;
}) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<typeof ANNOUNCE_TYPES[number]['key']>('news');
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePost() {
    if (!content.trim() || posting) return;
    setPosting(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveFamilyAnnouncement({
      authorId: member?.id ?? 'unknown',
      authorName: member?.name ?? '家庭成员',
      authorEmoji: member?.emoji ?? '👤',
      authorColor: member?.color ?? '#6B7280',
      content: content.trim(),
      emoji: ANNOUNCE_TYPES.find(t => t.key === type)?.emoji,
      type,
    });
    setPosting(false);
    setDone(true);
  }

  function handleClose() {
    setContent('');
    setType('news');
    setDone(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          {done ? (
            <View style={styles.modalDone}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>🎉</Text>
              <Text style={styles.modalDoneTitle}>公告已发布！</Text>
              <Text style={styles.modalDoneSubtitle}>所有家庭成员都能看到</Text>
              <TouchableOpacity style={styles.modalDoneBtn} onPress={() => { handleClose(); onPosted(); }}>
                <Text style={styles.modalDoneBtnText}>好的</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.modalTitle}>发布家庭公告</Text>
              <Text style={styles.modalSubtitle}>所有家庭成员都能看到</Text>
              <TextInput
                style={styles.modalInput}
                value={content}
                onChangeText={setContent}
                placeholder="输入公告内容，如：下周三复查，提醒大家早点出发…"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
              <View style={styles.typeRow}>
                {ANNOUNCE_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeChip, type === t.key && styles.typeChipActive]}
                    onPress={() => setType(t.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeChipText, type === t.key && styles.typeChipTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.postSubmitBtn, !content.trim() && styles.postSubmitBtnDisabled]}
                onPress={handlePost}
                activeOpacity={0.85}
                disabled={!content.trim()}
              >
                <Text style={[styles.postSubmitText, !content.trim() && styles.postSubmitTextDisabled]}>
                  {posting ? '发布中…' : '发布公告'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main: JoinerHomeScreen ───────────────────────────────────────────────────
export function JoinerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { memberships, activeMembership, switchFamily } = useFamilyContext();
  const [elderNickname, setElderNickname] = useState('家人');
  const [elderEmoji, setElderEmoji] = useState('🌸');
  const [caregiverName, setCaregiverName] = useState('');
  const [latestCheckIn, setLatestCheckIn] = useState<DailyCheckIn | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [latestAnnounce, setLatestAnnounce] = useState<FamilyAnnouncement | null>(null);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [postModal, setPostModal] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  const todayLabel = getFormattedDate();
  const lunarDate = getLunarDate();

  const loadData = useCallback(async () => {
    const profile = await getProfile();
    if (profile) {
      setElderNickname(profile.nickname || profile.name || '家人');
      setCaregiverName(profile.caregiverName || '');
      if (profile.zodiacEmoji) setElderEmoji(profile.zodiacEmoji);
    }
    const member = await getCurrentMember();
    setCurrentMember(member);

    const checkIns = await getAllCheckIns();
    setLatestCheckIn(checkIns[0] ?? null);

    const diaries = await getDiaryEntries();
    const announcements = await getFamilyAnnouncements(30);
    setLatestAnnounce(announcements[0] ?? null);

    setFeed(buildFeed(checkIns.slice(0, 2), diaries.slice(0, 3), announcements.slice(0, 2), profile?.caregiverName || '照顾者'));
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  function goSetup() {
    router.push('/(modals)/create-family' as any);
  }

  const greetingText = (() => {
    const h = new Date().getHours();
    if (h < 6) return '夜深了，注意休息';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  })();

  const TIPS = [
    '每天关注家人的状态，是最温暖的守护 💛',
    '一个微笑、一声问候，都是爱的传递 🌸',
    '陪伴是最长情的告白，感谢您的坚持 ✨',
    '记录下每一个美好的瞬间 📝',
    '家人的健康，从日常的点滴开始 🌿',
  ];
  const today = new Date();
  const localDay = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dailyTip = TIPS[localDay % TIPS.length];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FFF8F0', '#FEF0F5', '#F8F0FF', '#F0F4FF']}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={{ flex: 1, paddingTop: insets.top }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{todayLabel}</Text>
              <Text style={styles.lunarDot}>·</Text>
              <Text style={styles.lunarText}>{lunarDate.full}</Text>
            </View>
            <TouchableOpacity
              onPress={() => memberships.length > 1 && setShowSwitcher(true)}
              activeOpacity={memberships.length > 1 ? 0.7 : 1}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Text style={styles.pageTitle}>{greetingText} 👋</Text>
              {memberships.length > 1 && <Text style={styles.switcher}>▼</Text>}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.headerAvatar}
            onPress={() => router.push('/profile' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F9A8D4', '#F472B6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={{ fontSize: 22 }}>{currentMember?.emoji || '👤'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Daily Tip Banner ── */}
        <View style={styles.tipBanner}>
          <LinearGradient
            colors={['#FFF7ED', '#FFFBEB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.tipBannerInner}
          >
            <Text style={styles.tipIcon}>🌱</Text>
            <Text style={styles.tipText}>{dailyTip}</Text>
          </LinearGradient>
        </View>

        {/* ── Elder Status Card (redesigned) ── */}
        <View style={styles.elderCardNew}>
          <LinearGradient
            colors={['#FFFFFF', '#FFF9F5']}
            style={styles.elderCardBody}
          >
            <View style={styles.elderHeaderRow}>
              <View style={styles.elderAvatarNew}>
                <LinearGradient
                  colors={['#FBBF24', '#F59E0B']}
                  style={styles.elderAvatarGrad}
                >
                  <Text style={{ fontSize: 28 }}>{elderEmoji}</Text>
                </LinearGradient>
                <View style={[styles.statusIndicator, { backgroundColor: latestCheckIn ? '#34D399' : '#D1D5DB' }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.elderLabelNew}>被照顾者</Text>
                <Text style={styles.elderNameNew}>{elderNickname}</Text>
                <Text style={styles.elderStatusNew}>
                  {latestCheckIn
                    ? (latestCheckIn.moodScore >= 7 ? '😊 今天状态不错' : latestCheckIn.moodScore >= 5 ? '😌 今天还好' : '💜 需要多关注')
                    : '📋 暂无今日记录'}
                </Text>
              </View>
              {latestCheckIn?.careScore != null && (
                <View style={styles.scoreBadgeNew}>
                  <Text style={styles.scoreNumberNew}>{latestCheckIn.careScore}</Text>
                  <Text style={styles.scoreLabelNew}>分</Text>
                </View>
              )}
            </View>
            <View style={styles.metricsRowNew}>
              {[
                { emoji: latestCheckIn?.moodEmoji || '😊', label: '心情', val: latestCheckIn ? (latestCheckIn.moodScore >= 7 ? '好' : latestCheckIn.moodScore >= 5 ? '还好' : '需关注') : '—', color: '#F59E0B', bg: '#FFFBEB' },
                { emoji: '💤', label: '睡眠', val: latestCheckIn ? `${latestCheckIn.sleepHours}h` : '—', color: '#6366F1', bg: '#EEF2FF' },
                { emoji: latestCheckIn?.medicationTaken ? '✅' : (latestCheckIn ? '⚠️' : '💊'), label: '用药', val: latestCheckIn ? (latestCheckIn.medicationTaken ? '已服' : '未服') : '—', color: latestCheckIn?.medicationTaken ? '#10B981' : '#EF4444', bg: latestCheckIn?.medicationTaken ? '#ECFDF5' : '#FEF2F2' },
              ].map((m) => (
                <View key={m.label} style={[styles.metricItemNew, { backgroundColor: m.bg }]}>
                  <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
                  <Text style={styles.metricLabelNew}>{m.label}</Text>
                  <Text style={[styles.metricValNew, { color: m.color }]}>{m.val}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ── Announcement Card ── */}
        <AnnouncementCard
          latest={latestAnnounce}
          onPost={() => setPostModal(true)}
          onViewAll={() => router.push('/family' as any)}
        />

        {/* ── Feed ── */}
        {feed.length > 0 && (
          <View style={styles.feedSection}>
            <View style={styles.feedLabelRow}>
              <Text style={styles.feedLabelIcon}>📋</Text>
              <Text style={styles.feedSectionLabel}>今日活动记录</Text>
            </View>
            {feed.map((item, i) => (
              <FeedRow key={item.id} item={item} isLast={i === feed.length - 1} />
            ))}
          </View>
        )}

        {/* ── Empty state when no feed ── */}
        {feed.length === 0 && (
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedEmoji}>🌤️</Text>
            <Text style={styles.emptyFeedTitle}>今天还没有新动态</Text>
            <Text style={styles.emptyFeedSub}>主要照顾者完成打卡后，{'\n'}这里会显示{elderNickname}的最新状态</Text>
          </View>
        )}

        {/* ── Upgrade Card ── */}
        <UpgradeCard onPress={goSetup} />

        <View style={{ height: 24 }} />
      </ScrollView>

      <PostAnnouncementModal
        visible={postModal}
        onClose={() => setPostModal(false)}
        onPosted={() => { setPostModal(false); loadData(); }}
        member={currentMember}
      />

      {/* Family Switcher Modal */}
      <Modal visible={showSwitcher} transparent animationType="fade" onRequestClose={() => setShowSwitcher(false)}>
        <TouchableOpacity style={styles.switcherOverlay} activeOpacity={1} onPress={() => setShowSwitcher(false)}>
          <View style={styles.switcherSheet}>
            <Text style={styles.switcherTitle}>切换家庭</Text>
            {memberships.map(m => (
              <TouchableOpacity
                key={m.familyId}
                style={[styles.switcherRow, activeMembership?.familyId === m.familyId && styles.switcherRowActive]}
                onPress={async () => {
                  await switchFamily(m.familyId);
                  setShowSwitcher(false);
                  setTimeout(() => loadData(), 200);
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 12 }}>{m.room.members[0]?.emoji || '🏠'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switcherName}>{m.room.elderName}</Text>
                  <Text style={styles.switcherRole}>{m.role === 'creator' ? '📋 主要照顾者' : '👁️ 家庭成员'}</Text>
                </View>
                {activeMembership?.familyId === m.familyId && <Text style={{ fontSize: 16 }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.switcherAddBtn}
              onPress={() => { setShowSwitcher(false); setTimeout(() => router.push('/(modals)/create-family' as any), 200); }}
            >
              <Text style={styles.switcherAddText}>＋ 创建新家庭</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 16, paddingBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dateText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.3 },
  lunarDot: { fontSize: 12, color: '#D1D5DB' },
  lunarText: { fontSize: 11, color: '#B07848', fontWeight: '500' },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A2E', letterSpacing: -0.3 },
  switcher: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  headerAvatar: { ...SHADOWS.md, borderRadius: 24, overflow: 'hidden' },
  avatarGradient: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  tipBanner: { marginBottom: 16 },
  tipBannerInner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  tipIcon: { fontSize: 20 },
  tipText: { fontSize: 13, color: '#92400E', fontWeight: '600', flex: 1, lineHeight: 19 },

  elderCardNew: {
    borderRadius: 20, marginBottom: 16, overflow: 'hidden',
    ...SHADOWS.md, borderWidth: 1.5, borderColor: '#FDE8D0',
  },
  elderCardBody: { borderRadius: 20, padding: 18 },
  elderHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  elderAvatarNew: { position: 'relative' },
  elderAvatarGrad: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.sm,
  },
  statusIndicator: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2.5, borderColor: '#FFFFFF',
  },
  elderLabelNew: { fontSize: 11, fontWeight: '700', color: '#F97316', letterSpacing: 0.5, marginBottom: 2 },
  elderNameNew: { fontSize: 20, fontWeight: '900', color: '#1A1A2E', letterSpacing: -0.3, marginBottom: 3 },
  elderStatusNew: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  scoreBadgeNew: {
    backgroundColor: '#FFF7ED', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#FDBA74',
  },
  scoreNumberNew: { fontSize: 26, fontWeight: '900', color: '#EA580C', lineHeight: 28 },
  scoreLabelNew: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginTop: 1 },
  metricsRowNew: { flexDirection: 'row', gap: 10 },
  metricItemNew: {
    flex: 1, alignItems: 'center', gap: 4,
    paddingVertical: 12, borderRadius: 14,
  },
  metricLabelNew: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  metricValNew: { fontSize: 14, fontWeight: '800' },

  announceCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#BAE6FD',
    ...SHADOWS.md, overflow: 'hidden',
  },
  announceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  announceHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  announceHeaderIcon: { fontSize: 14 },
  announceHeaderTitle: { fontSize: 12, fontWeight: '700', color: '#0284C7', letterSpacing: 0.3 },
  postBtn: { backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#BAE6FD' },
  postBtnText: { fontSize: 12, fontWeight: '700', color: '#0EA5E9' },
  announceContent: { backgroundColor: '#F0F9FF', marginHorizontal: 12, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: '#E0F2FE' },
  announceText: { fontSize: 14, fontWeight: '600', color: '#0F172A', lineHeight: 20 },
  announceFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  announceAuthorEmoji: { fontSize: 13, marginRight: 4 },
  announceAuthorName: { fontSize: 12, color: '#0284C7', fontWeight: '600' },
  announceTime: { fontSize: 12, color: '#94A3B8' },
  announceEmpty: { paddingHorizontal: 16, paddingBottom: 10 },
  announceEmptyText: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
  viewAllBtn: { borderTopWidth: 1, borderTopColor: '#E0F2FE', paddingVertical: 10, backgroundColor: '#F0F9FF', alignItems: 'center' },
  viewAllBtnText: { fontSize: 12, fontWeight: '700', color: '#38BDF8' },

  feedSection: { marginBottom: 16 },
  feedLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  feedLabelIcon: { fontSize: 14 },
  feedSectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', letterSpacing: 0.3 },
  feedRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  feedTimeline: { alignItems: 'center', width: 30 },
  feedDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  feedLine: { width: 1, flex: 1, backgroundColor: '#E5E7EB', marginTop: 3, marginBottom: 3, minHeight: 16 },
  feedContent: { flex: 1, paddingBottom: 12 },
  feedTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' },
  feedTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  feedTagText: { fontSize: 11, fontWeight: '600' },
  feedAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  feedAuthorIcon: { fontSize: 10, opacity: 0.5 },
  feedAuthorName: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  feedTime: { fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' },
  feedTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  feedDetail: { fontSize: 12, color: '#6B7280', lineHeight: 17 },

  emptyFeed: { alignItems: 'center', paddingVertical: 28, marginBottom: 16 },
  emptyFeedEmoji: { fontSize: 36, marginBottom: 8 },
  emptyFeedTitle: { fontSize: 15, fontWeight: '700', color: '#9CA3AF', marginBottom: 4 },
  emptyFeedSub: { fontSize: 13, color: '#B0B8C4', textAlign: 'center', lineHeight: 20 },

  upgradeCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 12,
    ...SHADOWS.md, borderWidth: 1.5, borderColor: '#F3E8FF',
  },
  upgradeSectionLabel: { fontSize: 12, fontWeight: '700', color: '#7C3AED', letterSpacing: 0.5, marginBottom: 16 },
  upgradeIconRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  upgradeIconItem: { alignItems: 'center', gap: 6 },
  upgradeIconBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E9D5FF' },
  upgradeIconLabel: { fontSize: 12, color: '#7C3AED', fontWeight: '600' },
  upgradeDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  upgradeBtn: { borderRadius: 16, overflow: 'hidden' },
  upgradeBtnGradient: { paddingVertical: 15, alignItems: 'center' },
  upgradeBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },

  switcherOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  switcherSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36, ...SHADOWS.lg,
  },
  switcherTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', textAlign: 'center', marginBottom: 16 },
  switcherRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    marginBottom: 8, backgroundColor: '#F9FAFB',
  },
  switcherRowActive: { backgroundColor: '#F0FDF4', borderWidth: 1.5, borderColor: '#6C9E6C' },
  switcherName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  switcherRole: { fontSize: 12, color: '#6B7280' },
  switcherAddBtn: { marginTop: 8, paddingVertical: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  switcherAddText: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 16 },
  modalInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: '#1A1A2E', lineHeight: 22,
    minHeight: 110, textAlignVertical: 'top', marginBottom: 14,
  },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  typeChipActive: { backgroundColor: '#EFF6FF', borderColor: '#BAE6FD' },
  typeChipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  typeChipTextActive: { color: '#0EA5E9' },
  postSubmitBtn: { backgroundColor: '#0EA5E9', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  postSubmitBtnDisabled: { backgroundColor: '#F3F4F6' },
  postSubmitText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  postSubmitTextDisabled: { color: '#9CA3AF' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  modalDone: { alignItems: 'center', paddingVertical: 16 },
  modalDoneTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  modalDoneSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  modalDoneBtn: { backgroundColor: '#0EA5E9', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 40 },
  modalDoneBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
