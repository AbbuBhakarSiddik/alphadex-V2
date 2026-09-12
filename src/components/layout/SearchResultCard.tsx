import { View, Text, Image, Pressable, Linking } from "react-native";
import { CirclePlay, Newspaper, FileText } from "lucide-react-native";
import type { SearchResult } from "../../features/search/types";

type Props = { item: SearchResult };

export function SearchResultCard({ item }: Props) {
    const icon =
        item.type === "youtube" ? (
            <CirclePlay size={14} color="#EF4444" />
        ) : item.type === "paper" ? (
            <FileText size={14} color="#4F46E5" />
        ) : (
            <Newspaper size={14} color="#64748B" />
        );

    return (
        <Pressable
            onPress={() => Linking.openURL(item.url)}
            className="bg-white rounded-2xl mb-3 overflow-hidden border border-[#E8E8E8] shadow-sm shadow-gray-200/50"
        >
            {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} className="w-full h-40 bg-gray-100" resizeMode="cover" />
            ) : null}
            <View className="p-4">
                <View className="flex-row items-center mb-2">
                    {icon}
                    <Text className="text-gray-400 text-xs ml-1.5 uppercase tracking-wide">
                        {item.type === "paper" ? "Research Paper" : item.type}
                    </Text>
                </View>
                <Text className="text-[#1A1A1A] text-base font-semibold mb-1" numberOfLines={2}>
                    {item.title}
                </Text>
                {item.description ? (
                    <Text className="text-gray-500 text-sm" numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}