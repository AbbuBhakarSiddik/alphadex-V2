import React, { useState } from "react";
import { View, Text, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
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
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      {/* Header Row */}
      <View className="h-14 flex-row items-center justify-between px-6">
        <Pressable onPress={() => router.back()} className="p-1 rounded-full bg-white border border-[#E8E8E8]">
          <ArrowLeft size={20} color="#1A1A1A" strokeWidth={1.5} />
        </Pressable>
        <Text className="text-[#1A1A1A] font-extrabold text-lg">
          <Text className="text-[#FF6B35]">α</Text> Alphadex
        </Text>
      </View>

      <View className="flex-1 justify-center px-6 pb-8">
        <Text className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome back 👋</Text>
        <Text className="text-gray-500 text-sm mb-8">Sign in to resume your learning feed.</Text>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
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
            onPress={() => Alert.alert("Reset Password", "A reset link will be sent to your email (stub).")}
            className="absolute right-0 top-0.5"
          >
            <Text className="text-[#FF6B35] text-sm font-medium">Forgot?</Text>
          </Pressable>
        </View>

        <View className="mt-4 gap-4">
          <Button label="Sign In" onPress={handleSubmit} isLoading={isLoading} variant="primary" />

          <View className="flex-row items-center justify-center my-2">
            <View className="flex-1 h-[1px] bg-[#E8E8E8]" />
            <Text className="text-gray-400 text-xs px-3">or</Text>
            <View className="flex-1 h-[1px] bg-[#E8E8E8]" />
          </View>

          <Button
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            isLoading={isGoogleLoading}
            variant="secondary"
          />
        </View>

        <Pressable onPress={() => router.push("/(auth)/register")} className="mt-8 self-center">
          <Text className="text-gray-500 text-sm">
            Don't have an account? <Text className="text-[#FF6B35] font-semibold">Sign up →</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
