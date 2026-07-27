import { create } from "zustand";
import type { ScoredContentItem } from "./types";

type FeedState = {
  items: ScoredContentItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  needsRefresh: boolean;
  setItems: (items: ScoredContentItem[]) => void;
  toggleAction: (
    contentId: string,
    action: "liked" | "saved",
    value: boolean
  ) => void;
  setLoading: (v: boolean) => void;
  setRefreshing: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNeedsRefresh: (v: boolean) => void;
};

export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  needsRefresh: false,
  setItems: (items) => set({ items }),
  toggleAction: (contentId, action, value) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === contentId ? { ...item, [action]: value } : item
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setError: (error) => set({ error }),
  setNeedsRefresh: (needsRefresh) => set({ needsRefresh }),
}));
