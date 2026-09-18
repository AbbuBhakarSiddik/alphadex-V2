import React, { useState } from "react";
import { TextInput, TextInputProps, View, Text, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  secureTextEntry,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View className="w-full mb-4">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-xs font-semibold text-[#475569] tracking-wide">
          {label}
        </Text>
        {hint && (
          <Text className="text-[11px] text-[#94A3B8] font-normal">{hint}</Text>
        )}
      </View>

      <View
        className={`bg-white rounded-2xl border flex-row items-center justify-between shadow-xs transition-colors ${
          error
            ? "border-rose-400 bg-rose-50/20"
            : isFocused
            ? "border-[#0F172A] ring-1 ring-[#0F172A]"
            : "border-black/[0.08]"
        }`}
      >
        <TextInput
          className="text-[#0F172A] text-sm px-4 py-3.5 flex-1 font-medium"
          placeholderTextColor="#94A3B8"
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
            className="pr-4 py-3.5"
            hitSlop={8}
          >
            {showPassword ? (
              <EyeOff size={18} color="#64748B" strokeWidth={1.75} />
            ) : (
              <Eye size={18} color="#64748B" strokeWidth={1.75} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="text-rose-600 text-xs mt-1.5 font-medium ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
