import React, { useState } from "react";
import { TextInput, TextInputProps, View, Text, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, secureTextEntry, onFocus, onBlur, ...inputProps }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View className="w-full mb-4">
      <Text className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">{label}</Text>
      <View
        className={`bg-[#121212] rounded-xl border flex-row items-center justify-between ${
          error
            ? "border-red-500"
            : isFocused
            ? "border-white"
            : "border-[#27272A]"
        }`}
      >
        <TextInput
          className="text-[#F5F5F7] text-sm px-4 py-3 flex-1 rounded-xl"
          placeholderTextColor="#71717A"
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="pr-4 py-3"
            hitSlop={8}
          >
            {showPassword ? (
              <EyeOff size={18} color="#A1A1AA" strokeWidth={1.5} />
            ) : (
              <Eye size={18} color="#A1A1AA" strokeWidth={1.5} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-red-400 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
