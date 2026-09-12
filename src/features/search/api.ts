import { supabase } from "../../lib/supabase";
import type { SearchResult } from "./types";

export async function searchContent(query: string): Promise<SearchResult[]> {
    const { data, error } = await supabase.functions.invoke("search-content", {
        body: { query },
    });
    if (error) throw error;
    return (data?.results ?? []) as SearchResult[];
}