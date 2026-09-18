import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, Sparkles, MessageCircle, User, Shield } from "lucide-react-native";
import { useAuth } from "../../src/features/auth/hooks";

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
            <View className="h-[1px] w-full bg-white/15" />
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
            <View className="items-center justify-center">
              <Home color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && (
                <View className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm shadow-white" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Search color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && (
                <View className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm shadow-white" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Tutor",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Sparkles color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && (
                <View className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm shadow-white" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="global-chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <MessageCircle color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && (
                <View className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm shadow-white" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <User color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && (
                <View className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm shadow-white" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? "/(tabs)/admin" : null,
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <Shield color={color} size={20} strokeWidth={focused ? 2.2 : 1.8} />
              {focused && (
                <View className="w-1.5 h-1.5 rounded-full bg-white mt-1 shadow-sm shadow-white" />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
