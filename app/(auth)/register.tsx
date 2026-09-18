import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, UserPlus, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/features/auth/hooks";

function getPasswordStrength(pass: string): {
  score: number;
  label: string;
  colorClass: string;
} {
  if (!pass) return { score: 0, label: "", colorClass: "bg-slate-100" };
  if (pass.length < 6)
    return { score: 1, label: "Weak", colorClass: "bg-rose-400" };

  let score = 2; // Fair
  const hasNumbers = /\d/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  if (hasNumbers || hasUpper) {
    score = 3; // Good
  }
  if (pass.length >= 8 && hasNumbers && (hasUpper || hasSpecial)) {
    score = 4; // Strong
  }

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-slate-100",
    "bg-rose-400",
    "bg-amber-400",
    "bg-indigo-400",
    "bg-emerald-500",
  ];

  return { score, label: labels[score], colorClass: colors[score] };
}

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await signUp({ email, password, fullName });
      router.push("/(auth)/interests");
    } catch (err) {
      Alert.alert(
        "Couldn't create account",
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
        colors={["rgba(255, 237, 213, 0.45)", "rgba(254, 243, 199, 0.2)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: -30,
          left: -40,
          width: 260,
          height: 260,
          borderRadius: 130,
        }}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 px-6"
        >
          {/* Top Navigation Bar */}
          <View className="h-14 flex-row items-center justify-between mb-3">
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

          {/* Bento Header & Form Container */}
          <View className="my-auto py-2">
            <View className="mb-4">
              <View className="flex-row items-center gap-1.5 mb-2">
                <View className="w-5 h-5 rounded-full bg-emerald-50 items-center justify-center">
                  <UserPlus size={11} color="#10B981" />
                </View>
                <Text className="text-xs font-semibold text-emerald-600 tracking-wide">
                  Step 1 of 2: Get Started
                </Text>
              </View>
              <Text className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Create your learner profile
              </Text>
              <Text className="text-xs text-[#64748B] mt-1">
                Unlock your tailored daily learning feed and streak rewards.
              </Text>
            </View>

            {/* Pure White Bento Form Tile */}
            <View className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-sm">
              <TextField
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Alex Morgan"
              />

              <TextField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="alex@example.com"
              />

              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="At least 6 characters"
              />

              {/* Refined Password Strength Indicator */}
              {password.length > 0 && (
                <View className="mb-4 bg-slate-50/70 p-2.5 rounded-xl border border-black/[0.03]">
                  <View className="flex-row gap-1.5 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        className={`flex-1 h-1 rounded-full ${
                          i <= strength.score ? strength.colorClass : "bg-slate-200/80"
                        }`}
                      />
                    ))}
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[11px] text-[#64748B]">
                      Security:{" "}
                      <Text className="font-bold text-[#0F172A]">{strength.label}</Text>
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <ShieldCheck size={11} color="#10B981" />
                      <Text className="text-[10px] text-emerald-600 font-medium">
                        Encrypted
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <TextField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Re-enter your password"
              />

              <View className="mt-2">
                <Button
                  label="Continue to Interests →"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  variant="primary"
                />
              </View>
            </View>

            {/* Footer Sign-in Link */}
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              className="mt-6 py-2 self-center"
            >
              <Text className="text-[#64748B] text-xs font-medium">
                Already have an account?{" "}
                <Text className="text-[#0F172A] font-bold">Sign in →</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
