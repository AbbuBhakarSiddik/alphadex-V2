import { useState, useEffect, useCallback, useMemo } from "react";
import type { StudyScheduleItem } from "./types";
import {
  fetchSchedule,
  addScheduleItem,
  toggleComplete,
  deleteScheduleItem,
  generatePlan,
} from "./api";

export function useSchedule() {
  const [items, setItems] = useState<StudyScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSchedule();
      setItems(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load study schedule");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Group items by scheduled_date
  const groupedByDate = useMemo(() => {
    const map: Record<string, StudyScheduleItem[]> = {};
    for (const item of items) {
      const date = item.scheduled_date || "Undated";
      if (!map[date]) {
        map[date] = [];
      }
      map[date].push(item);
    }
    return map;
  }, [items]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort();
  }, [groupedByDate]);

  // Count upcoming sessions this week
  const upcomingThisWeekCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    return items.filter((item) => {
      if (item.completed) return false;
      const d = new Date(item.scheduled_date);
      return !isNaN(d.getTime()) && d >= today && d <= endOfWeek;
    }).length;
  }, [items]);

  const add = useCallback(
    async (
      title: string,
      topic: string,
      scheduledDate: string,
      durationMinutes: number
    ) => {
      try {
        const newItem = await addScheduleItem(
          title,
          topic,
          scheduledDate,
          durationMinutes
        );
        setItems((prev) => [...prev, newItem].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
        return newItem;
      } catch (err: any) {
        setError(err?.message || "Failed to add study session");
        throw err;
      }
    },
    []
  );

  const toggle = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id);
      if (!target) return;

      const newCompleted = !target.completed;

      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: newCompleted } : item
        )
      );

      try {
        await toggleComplete(id, newCompleted);
      } catch (err: any) {
        // Revert on error
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, completed: target.completed } : item
          )
        );
        setError(err?.message || "Failed to update item status");
        throw err;
      }
    },
    [items]
  );

  const remove = useCallback(
    async (id: string) => {
      const previous = items;
      // Optimistic delete
      setItems((prev) => prev.filter((i) => i.id !== id));

      try {
        await deleteScheduleItem(id);
      } catch (err: any) {
        setItems(previous);
        setError(err?.message || "Failed to delete item");
        throw err;
      }
    },
    [items]
  );

  const generateAIPlan = useCallback(
    async (daysAhead = 7) => {
      setIsGenerating(true);
      setError(null);
      try {
        const res = await generatePlan(daysAhead);
        if (!res.success || !res.items) {
          throw new Error(res.reason || "Couldn't generate a plan, try again");
        }
        await loadSchedule();
        return res.items;
      } catch (err: any) {
        const msg = err?.message || "Couldn't generate a plan, try again";
        setError(msg);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [loadSchedule]
  );

  return {
    items,
    groupedByDate,
    sortedDates,
    upcomingThisWeekCount,
    isLoading,
    isGenerating,
    error,
    add,
    toggle,
    remove,
    generateAIPlan,
    refresh: loadSchedule,
  };
}
