import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextField } from "../../src/components/ui/TextField";
import { SearchResultCard } from "../../src/components/layout/SearchResultCard";
import { useSearch } from "../../src/features/search/hooks";

export default function Search() {
  const { query, results, isSearching, error, hasSearched, runSearch } = useSearch();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-[#1A1A1A] text-2xl font-bold mb-3">Search</Text>
        <TextField
          label="Search"
          value={query}
          onChangeText={runSearch}
          placeholder="Search videos, articles, research papers..."
        />
      </View>

      {isSearching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF6B35" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[#F72C25] text-center">{error}</Text>
        </View>
      ) : !hasSearched ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-400 text-center">
            Search across videos, news, and academic papers.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-400 text-center">No results found.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          renderItem={({ item }) => <SearchResultCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}