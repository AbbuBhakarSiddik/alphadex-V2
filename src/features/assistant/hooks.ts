import { useState, useEffect, useCallback, useRef } from "react";
import { fetchChatHistory, sendTutorMessage } from "./api";
import type { TutorMessage } from "./types";

export function useTutorChat() {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastSentTextRef = useRef<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchChatHistory();
      setMessages(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load chat history"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      lastSentTextRef.current = trimmed;
      setError(null);
      setIsSending(true);

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const optimisticMsg: TutorMessage = {
        id: tempId,
        role: "user",
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      // Optimistically append user message immediately
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const res = await sendTutorMessage(trimmed);

        if (res.success && res.reply) {
          const assistantMsg: TutorMessage = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            role: "assistant",
            content: res.reply,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          setError(res.reason || "Unable to get a response from AI Tutor");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Network error contacting AI Tutor"
        );
      } finally {
        setIsSending(false);
      }
    },
    [isSending]
  );

  const retry = useCallback(() => {
    if (lastSentTextRef.current && !isSending) {
      send(lastSentTextRef.current);
    }
  }, [send, isSending]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    error,
    send,
    retry,
    clearError,
    refresh: loadHistory,
  };
}
