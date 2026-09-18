import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, Sparkles, MessageCircle, User, Shield } from "lucide-react-native";
import { useAuth } from "../../src/features/auth/hooks";

import type { ColorValue } from "react-native";

interface TabBarIconProps {
  Icon: React.ComponentType<{ color: any; size: number; strokeWidth: number }>;
  color: ColorValue | string;
  focused: boolean;
}

function TabBarIcon({ Icon, color, focused }: TabBarIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Icon color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

export default function TabsLayout() {
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;
  const tabHeight = 52 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#71717A",
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor:
            Platform.OS === "ios" ? "rgba(8, 8, 10, 0.65)" : "rgba(8, 8, 10, 0.92)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.tabBarTopBorder} />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Search} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Tutor",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Sparkles} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="global-chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={MessageCircle} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? "/(tabs)/admin" : null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Shield} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginTop: 4,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBarTopBorder: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});
