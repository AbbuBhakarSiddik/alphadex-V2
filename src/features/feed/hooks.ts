import { useCallback, useEffect } from "react";
import { useFeedStore } from "./store";
import { fetchFeed, setUserAction } from "./api";

export function useFeed() {
  const {
    items,
    isLoading,
    isRefreshing,
    error,
    setItems,
    toggleAction,
    setLoading,
    setRefreshing,
    setError,
  } = useFeedStore();

  const load = useCallback(
    async (opts?: { forceRefresh?: boolean }) => {
      const setBusy = opts?.forceRefresh ? setRefreshing : setLoading;
      setBusy(true);
      setError(null);
      try {
        const payload = await fetchFeed(opts);
        setItems(payload.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feed");
      } finally {
        setBusy(false);
      }
    },
    [setItems, setLoading, setRefreshing, setError]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const like = useCallback(
    async (contentId: string, currentlyLiked: boolean) => {
      // Optimistic update — flip the UI instantly, revert on failure
      toggleAction(contentId, "liked", !currentlyLiked);
      try {
        await setUserAction(contentId, "like", !currentlyLiked);
      } catch {
        toggleAction(contentId, "liked", currentlyLiked); // revert
      }
    },
    [toggleAction]
  );

  const save = useCallback(
    async (contentId: string, currentlySaved: boolean) => {
      toggleAction(contentId, "saved", !currentlySaved);
      try {
        await setUserAction(contentId, "save", !currentlySaved);
      } catch {
        toggleAction(contentId, "saved", currentlySaved); // revert
      }
    },
    [toggleAction]
  );

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load({ forceRefresh: true }),
    like,
    save,
  };
}
