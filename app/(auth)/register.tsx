import React, { useState } from "react";
import { View, Text, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/features/auth/hooks";

function getPasswordStrength(pass: string): { score: number; label: string; colorClass: string } {
  if (!pass) return { score: 0, label: "", colorClass: "bg-gray-200" };
  if (pass.length < 6) return { score: 1, label: "Weak", colorClass: "bg-[#F72C25]" };
  
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
  const colors = ["bg-gray-200", "bg-[#F72C25]", "bg-[#FF6B35]", "bg-[#FBBF24]", "bg-[#10B981]"];

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
        <Text className="text-3xl font-bold text-[#1A1A1A] mb-2">Create account</Text>
        <Text className="text-gray-500 text-sm mb-6">Sign up to get your personalized learning feed.</Text>

        <TextField
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Sophia Nguyen"
        />

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />

        {/* Password Strength Bar */}
        {password.length > 0 && (
          <View className="mb-4">
            <View className="flex-row gap-1 mt-1 mb-1.5">
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i <= strength.score ? strength.colorClass : "bg-[#E8E8E8]"
                  }`}
                />
              ))}
            </View>
            <Text className="text-xs text-gray-500">
              Password strength: <Text className="font-semibold">{strength.label}</Text>
            </Text>
          </View>
        )}

        <TextField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Re-enter your password"
        />

        <View className="mt-4">
          <Button label="Sign Up" onPress={handleSubmit} isLoading={isLoading} variant="primary" />
        </View>

        <Pressable onPress={() => router.push("/(auth)/login")} className="mt-6 self-center">
          <Text className="text-gray-500 text-sm">
            Already have an account? <Text className="text-[#FF6B35] font-semibold">Sign in →</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
