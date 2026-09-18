import React, { useState } from "react";
import { View, Text, Alert, Pressable, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/features/auth/hooks";

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert(
        "Google sign-in failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await signIn({ email, password });
    } catch (err) {
      Alert.alert(
        "Couldn't sign in",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9FB]" edges={["top", "bottom"]}>
      {/* Ambient Pastel Background Glow */}
      <LinearGradient
        colors={["rgba(237, 233, 254, 0.4)", "rgba(238, 242, 255, 0.2)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 260,
          height: 260,
          borderRadius: 130,
        }}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6"
        >
          {/* Top Navigation Bar */}
          <View className="h-14 flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-white border border-black/[0.04] items-center justify-center shadow-xs active:bg-slate-50"
            >
              <ArrowLeft size={18} color="#0F172A" strokeWidth={2} />
            </Pressable>

            <View className="flex-row items-center gap-2 bg-white/90 border border-black/[0.04] px-3 py-1.5 rounded-full shadow-xs">
              <Image
                source={require("../../assets/logo.png")}
                style={{ width: 18, height: 18, borderRadius: 5 }}
                resizeMode="cover"
              />
              <Text className="text-[#0F172A] font-bold text-xs tracking-tight">
                Alphadex
              </Text>
            </View>

            <View className="w-10" />
          </View>

          {/* Bento Header & Form Card */}
          <View className="my-auto py-4">
            <View className="mb-5">
              <View className="flex-row items-center gap-1.5 mb-2">
                <View className="w-5 h-5 rounded-full bg-indigo-50 items-center justify-center">
                  <Sparkles size={11} color="#4F46E5" />
                </View>
                <Text className="text-xs font-semibold text-indigo-600 tracking-wide">
                  Welcome Back
                </Text>
              </View>
              <Text className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Sign in to your learning feed
              </Text>
              <Text className="text-xs text-[#64748B] mt-1">
                Pick up right where you left off with your lessons.
              </Text>
            </View>

            {/* Pure White Bento Form Tile */}
            <View className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-sm">
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="student@alphadex.edu"
              />

              <View className="relative">
                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                />
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Reset Password",
                      "A password reset link will be sent to your email."
                    )
                  }
                  className="absolute right-0 top-0.5"
                  hitSlop={8}
                >
                  <Text className="text-xs font-semibold text-[#4F46E5]">
                    Forgot?
                  </Text>
                </Pressable>
              </View>

              <View className="mt-2 gap-3.5">
                <Button
                  label="Sign In"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  variant="primary"
                />

                <View className="flex-row items-center justify-center my-1">
                  <View className="flex-1 h-[1px] bg-slate-100" />
                  <Text className="text-[#94A3B8] text-xs px-3 font-medium">
                    or continue with
                  </Text>
                  <View className="flex-1 h-[1px] bg-slate-100" />
                </View>

                <Button
                  label="Continue with Google"
                  onPress={handleGoogleSignIn}
                  isLoading={isGoogleLoading}
                  variant="secondary"
                />
              </View>
            </View>

            {/* Footer Registration Link */}
            <Pressable
              onPress={() => router.push("/(auth)/register")}
              className="mt-6 py-2 self-center"
            >
              <Text className="text-[#64748B] text-xs font-medium">
                New to Alphadex?{" "}
                <Text className="text-[#0F172A] font-bold">
                  Create an account →
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
