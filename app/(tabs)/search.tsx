import React from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon } from "lucide-react-native";
import { TextField } from "../../src/components/ui/TextField";
import { SearchResultCard } from "../../src/components/layout/SearchResultCard";
import { useSearch } from "../../src/features/search/hooks";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";

export default function Search() {
  const insets = useSafeAreaInsets();
  const { query, results, isSearching, error, hasSearched, runSearch } = useSearch();

  const bottomPadding = (insets.bottom > 0 ? insets.bottom : 8) + 68;

  return (
    <AuroraBackground>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Swiss Minimalist Search Header */}
        <View className="px-5 pt-3 pb-1 border-b border-white/5 bg-black/30 backdrop-blur-md">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            <Text className="text-white text-base font-bold tracking-tight">
              Knowledge Index
            </Text>
            <Text className="text-[#52525B] text-[11px] font-mono font-medium ml-1">
              03 // SEARCH
            </Text>
          </View>

          <TextField
            label=""
            value={query}
            onChangeText={runSearch}
            placeholder="Search YouTube code walkthroughs, arXiv papers..."
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>

        {isSearching ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#FFFFFF" size="large" />
            <Text className="text-[#71717A] text-xs font-mono mt-3">
              Querying distributed index...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-red-400 text-sm font-semibold text-center">{error}</Text>
          </View>
        ) : !hasSearched ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-12 h-12 rounded-2xl bg-[#12121A] border border-white/10 items-center justify-center mb-3 shadow-md">
              <SearchIcon size={20} color="#71717A" />
            </View>
            <Text className="text-white text-sm font-semibold mb-1">
              Search the knowledge graph
            </Text>
            <Text className="text-[#71717A] text-xs text-center max-w-[250px] leading-relaxed">
              Real-time cross-indexing across educational YouTube tutorials, technical blogs, and academic whitepapers.
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-[#A1A1AA] text-sm text-center">
              No results found for "{query}".
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: bottomPadding,
            }}
            renderItem={({ item }) => <SearchResultCard item={item} />}
          />
        )}
      </SafeAreaView>
    </AuroraBackground>
  );
}