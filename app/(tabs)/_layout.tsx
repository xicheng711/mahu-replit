import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { Platform, View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors, Gradients, Shadows } from "@/lib/design-tokens";

const INACTIVE_LABEL = AppColors.nav.inactive;

const TAB_CONFIG: Record<string, {
  emoji: string;
  gradient: readonly [string, string];
  label: string;
}> = {
  index:      { emoji: "🏠", gradient: Gradients.coral,   label: "首页" },
  checkin:    { emoji: "✨", gradient: Gradients.green,   label: "每日打卡" },
  medication: { emoji: "💊", gradient: Gradients.peach,   label: "用药记录" },
  diary:      { emoji: "📔", gradient: Gradients.purple,  label: "日记" },
  family:     { emoji: "👥", gradient: Gradients.navActive, label: "家人共享" },
};

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  const cfg = TAB_CONFIG[route] ?? {
    emoji: "⭕", gradient: ["#ccc", "#aaa"] as readonly [string, string], label: "",
  };

  return (
    <View style={styles.tabItem}>
      {focused ? (
        <LinearGradient
          colors={cfg.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Text style={styles.activeEmoji}>{cfg.emoji}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.iconCircle, styles.inactiveCircle]}>
          <Text style={styles.inactiveEmoji}>{cfg.emoji}</Text>
        </View>
      )}
      <Text style={[styles.tabLabel, focused && { color: cfg.gradient[0], fontWeight: "700" as const }]}>
        {cfg.label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const safeBottom = Platform.OS === "web" ? 0 : insets.bottom;
  const tabBarHeight = 68 + safeBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: safeBottom,
          paddingTop: 4,
          backgroundColor: AppColors.surface.whiteStrong,
          borderTopWidth: 0,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          shadowColor: AppColors.shadow.default,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
          overflow: Platform.OS === "android" ? "hidden" : undefined,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          height: "100%",
        },
      }}
    >
      <Tabs.Screen name="index"      options={{ title: "首页",    tabBarIcon: ({ focused }) => <TabIcon route="index"      focused={focused} /> }} />
      <Tabs.Screen name="checkin"    options={{ title: "每日打卡", tabBarIcon: ({ focused }) => <TabIcon route="checkin"    focused={focused} /> }} />
      <Tabs.Screen name="medication" options={{ title: "用药记录", tabBarIcon: ({ focused }) => <TabIcon route="medication" focused={focused} /> }} />
      <Tabs.Screen name="diary"      options={{ title: "日记",    tabBarIcon: ({ focused }) => <TabIcon route="diary"      focused={focused} /> }} />
      <Tabs.Screen name="family"     options={{ title: "家人共享", tabBarIcon: ({ focused }) => <TabIcon route="family"     focused={focused} /> }} />
    </Tabs>
  );
}

const CIRCLE = 44;

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 2,
  },
  iconCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveCircle: {
    backgroundColor: AppColors.bg.secondary,
  },
  activeEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  inactiveEmoji: {
    fontSize: 18,
    lineHeight: 22,
    opacity: 0.65,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: INACTIVE_LABEL,
    letterSpacing: 0.2,
  },
});
