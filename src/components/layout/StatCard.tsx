import React from "react";
import { View, Text } from "react-native";

type Props = {
  icon: React.ComponentType<any>;
  value: string;
  label: string;
  delta?: string;
  deltaPositive?: boolean;
};

export function StatCard({ icon: Icon, value, label, delta, deltaPositive = true }: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-200/60 flex-1 border border-[#E8E8E8]">
      <View className="w-10 h-10 rounded-xl bg-[#FFF5F0] items-center justify-center mb-3">
        <Icon size={20} color="#FF6B35" strokeWidth={1.5} />
      </View>
      <Text className="text-2xl font-bold text-[#1A1A1A]">{value}</Text>
      <Text className="text-xs text-gray-500 mt-0.5">{label}</Text>
      {delta ? (
        <Text
          className={`text-xs font-medium mt-1 ${
            deltaPositive ? "text-[#10B981]" : "text-[#F72C25]"
          }`}
        >
          {delta}
        </Text>
      ) : null}
    </View>
  );
}
