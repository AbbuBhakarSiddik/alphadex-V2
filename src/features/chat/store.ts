import { create } from "zustand";
import type { ChatMessage } from "./types";

type ChatState = {
  activeRoomId: string;
  messages: Record<string, ChatMessage[]>;
  setActiveRoomId: (roomId: string) => void;
  setRoomMessages: (roomId: string, messages: ChatMessage[]) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeRoomId: "global",
  messages: {},
  setActiveRoomId: (activeRoomId) => set({ activeRoomId }),
  setRoomMessages: (roomId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    })),
  addMessage: (roomId, message) =>
    set((state) => {
      const current = state.messages[roomId] || [];
      if (current.some((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [roomId]: [message, ...current],
        },
      };
    }),
}));
