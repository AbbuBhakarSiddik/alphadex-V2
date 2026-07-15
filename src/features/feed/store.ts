import { create } from "zustand";
import type { ScoredContentItem } from "./types";

type FeedState = {
  items: ScoredContentItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  setItems: (items: ScoredContentItem[]) => void;
  toggleAction: (
    contentId: string,
    action: "liked" | "saved",
    value: boolean
  ) => void;
  setLoading: (v: boolean) => void;
  setRefreshing: (v: boolean) => void;
  setError: (v: string | null) => void;
};

export const useFeedStore = create<FeedState>((set) => ({
  items: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
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
}));
