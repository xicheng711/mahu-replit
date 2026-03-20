import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { Platform, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const INACTIVE_ICON_COLOR = "#6B7280";
const INACTIVE_BG = "#F3F4F6";
const INACTIVE_LABEL = "#6B7280";

// 每个 tab 的激活渐变色（参考 Figma）
const TAB_CONFIG: Record<string, {
  outline: keyof typeof Ionicons.glyphMap;
  filled: keyof typeof Ionicons.glyphMap;
  gradient: [string, string, string];
  label: string;
}> = {
  index:      { outline: "home-outline",    filled: "home",    gradient: ["#FF8904", "#FF637E", "#F6339A"], label: "首页" },
  checkin:    { outline: "sparkles-outline",filled: "sparkles",gradient: ["#34D399", "#10B981", "#059669"], label: "每日打卡" },
  medication: { outline: "medical-outline", filled: "medical", gradient: ["#FDA4AF", "#F43F5E", "#E11D48"], label: "用药记录" },
  diary:      { outline: "book-outline",    filled: "book",    gradient: ["#7DD3FC", "#38BDF8", "#0EA5E9"], label: "日记" },
  family:     { outline: "people-outline",  filled: "people",  gradient: ["#D8B4FE", "#A855F7", "#9333EA"], label: "家人共享" },
};

function TabIcon({ route, focused }: { route: string; focused: boolean }) {
  const cfg = TAB_CONFIG[route] ?? {
    outline: "ellipse-outline", filled: "ellipse",
    gradient: ["#ccc", "#aaa", "#888"] as [string, string, string],
    label: "",
  };

  return (
    <View style={styles.tabItem}>
      {/* 图标圆形 */}
      {focused ? (
        <LinearGradient
          colors={cfg.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons name={cfg.filled} size={22} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.iconCircle, { backgroundColor: INACTIVE_BG }]}>
          <Ionicons name={cfg.outline} size={22} color={INACTIVE_ICON_COLOR} />
        </View>
      )}

      {/* 文字标签 */}
      <Text style={[
        styles.tabLabel,
        focused && { color: cfg.gradient[1], fontWeight: "700" },
      ]}>
        {cfg.label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const safeBottom = Platform.OS === "web" ? 0 : insets.bottom;
  const tabBarHeight = 72 + safeBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: safeBottom,
          paddingTop: 6,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.10,
          shadowRadius: 20,
          elevation: 24,
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

const CIRCLE_SIZE = 48;

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 4,
  },
  iconCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: INACTIVE_LABEL,
    letterSpacing: 0.2,
  },
});
