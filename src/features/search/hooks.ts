import { useCallback, useEffect, useRef, useState } from "react";
import { searchContent } from "./api";
import type { SearchResult } from "./types";

const DEBOUNCE_MS = 500;

export function useSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const executeSearch = useCallback(async (q: string) => {
        setIsSearching(true);
        setError(null);
        try {
            const r = await searchContent(q);
            setResults(r);
            setHasSearched(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Search failed");
        } finally {
            setIsSearching(false);
        }
    }, []);

    const runSearch = useCallback(
        (q: string) => {
            setQuery(q);
            if (debounceRef.current) clearTimeout(debounceRef.current);

            if (!q.trim()) {
                setResults([]);
                setHasSearched(false);
                return;
            }

            debounceRef.current = setTimeout(() => executeSearch(q), DEBOUNCE_MS);
        },
        [executeSearch]
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return { query, results, isSearching, error, hasSearched, runSearch };
}