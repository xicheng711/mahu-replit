import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '@/lib/design-tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E8E0E5',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function FamilySkeleton() {
  return (
    <View style={sk.container}>
      <View style={sk.header}>
        <SkeletonBlock width={200} height={28} borderRadius={14} />
        <SkeletonBlock width={120} height={16} borderRadius={8} style={{ marginTop: 8 }} />
      </View>

      <View style={sk.tabs}>
        <SkeletonBlock width={100} height={36} borderRadius={18} />
        <SkeletonBlock width={100} height={36} borderRadius={18} style={{ marginLeft: 12 }} />
      </View>

      <View style={sk.card}>
        <View style={sk.cardHeader}>
          <SkeletonBlock width={36} height={36} borderRadius={18} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBlock width={80} height={14} />
            <SkeletonBlock width={140} height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
        <SkeletonBlock width="100%" height={14} style={{ marginTop: 14 }} />
        <SkeletonBlock width="80%" height={14} style={{ marginTop: 8 }} />
        <SkeletonBlock width="60%" height={14} style={{ marginTop: 8 }} />
      </View>

      <View style={sk.card}>
        <View style={sk.cardHeader}>
          <SkeletonBlock width={36} height={36} borderRadius={18} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBlock width={60} height={14} />
            <SkeletonBlock width={100} height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
        <SkeletonBlock width="100%" height={14} style={{ marginTop: 14 }} />
        <SkeletonBlock width="70%" height={14} style={{ marginTop: 8 }} />
      </View>

      <View style={sk.card}>
        <View style={sk.cardHeader}>
          <SkeletonBlock width={36} height={36} borderRadius={18} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBlock width={70} height={14} />
            <SkeletonBlock width={110} height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
        <SkeletonBlock width="90%" height={14} style={{ marginTop: 14 }} />
      </View>
    </View>
  );
}

export function BriefingSkeleton() {
  return (
    <View style={sk.container}>
      <View style={sk.briefingCard}>
        <SkeletonBlock width={160} height={20} borderRadius={10} />
        <SkeletonBlock width="100%" height={60} borderRadius={12} style={{ marginTop: 16 }} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <SkeletonBlock width={80} height={40} borderRadius={8} />
          <SkeletonBlock width={80} height={40} borderRadius={8} />
          <SkeletonBlock width={80} height={40} borderRadius={8} />
        </View>
        <SkeletonBlock width="100%" height={14} style={{ marginTop: 16 }} />
        <SkeletonBlock width="85%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function WeeklyEchoSkeleton() {
  return (
    <View style={sk.echoCard}>
      <SkeletonBlock width={180} height={18} borderRadius={10} />
      <SkeletonBlock width="100%" height={80} borderRadius={12} style={{ marginTop: 14 }} />
      <SkeletonBlock width="70%" height={14} style={{ marginTop: 12 }} />
    </View>
  );
}

export { SkeletonBlock };

const sk = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FDF9F7',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(206,196,242,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  briefingCard: {
    backgroundColor: '#FDF9F7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(206,196,242,0.2)',
  },
  echoCard: {
    padding: 20,
    gap: 4,
  },
});
