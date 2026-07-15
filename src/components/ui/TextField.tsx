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
      <Text className="text-sm font-medium text-[#374151] mb-1.5">{label}</Text>
      <View
        className={`bg-white rounded-xl border shadow-sm shadow-gray-200/50 flex-row items-center justify-between ${
          error
            ? "border-[#F72C25]"
            : isFocused
            ? "border-primary"
            : "border-[#E8E8E8]"
        }`}
      >
        <TextInput
          className="text-[#1A1A1A] text-base px-4 py-3.5 flex-1 rounded-xl"
          placeholderTextColor="#9CA3AF"
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
          >
            {showPassword ? (
              <EyeOff size={18} color="#9CA3AF" strokeWidth={1.5} />
            ) : (
              <Eye size={18} color="#9CA3AF" strokeWidth={1.5} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-[#F72C25] text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
