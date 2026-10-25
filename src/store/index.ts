import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { User, Collection, ChatSession, ChatMessage } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
        set({ token, isAuthenticated: !!token });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.login(email, password);
          localStorage.setItem("token", response.access_token);
          set({ token: response.access_token, isAuthenticated: true });
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, username, password) => {
        set({ isLoading: true });
        try {
          const response = await api.register({ email, username, password });
          localStorage.setItem("token", response.access_token);
          set({ token: response.access_token, isAuthenticated: true });
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem("token");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    }
  )
);

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  isLoading: boolean;
  error: string | null;
  setCollections: (collections: Collection[]) => void;
  setCurrentCollection: (collection: Collection | null) => void;
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<void>;
  createCollection: (data: { name: string; url: string; max_pages?: number; max_depth?: number }) => Promise<{ collection_id: string; job_id: string }>;
  deleteCollection: (id: string) => Promise<void>;
  updateCollectionStatus: (id: string, status: string, pages_count?: number) => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  currentCollection: null,
  isLoading: false,
  error: null,

  setCollections: (collections) => set({ collections }),
  setCurrentCollection: (collection) => set({ currentCollection: collection }),

  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      // Use getMyCollections to fetch only the current user's collections
      const response = await api.getMyCollections();
      set({ collections: response.collections as Collection[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCollection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const collection = await api.getCollection(id) as Collection;
      set({ currentCollection: collection });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createCollection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      const response = await api.createCollection({
        ...data,
        user_id: user?.id,
      });
      await get().fetchCollections();
      return { collection_id: response.collection_id, job_id: response.job_id };
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCollection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteCollection(id);
      set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCollectionStatus: (id, status, pages_count) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id
          ? { ...c, status: status as Collection["status"], pages_count: pages_count ?? c.pages_count }
          : c
      ),
      currentCollection:
        state.currentCollection?.id === id
          ? { ...state.currentCollection, status: status as Collection["status"], pages_count: pages_count ?? state.currentCollection.pages_count }
          : state.currentCollection,
    }));
  },
}));

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  setSessions: (sessions: ChatSession[]) => void;
  setCurrentSession: (session: ChatSession | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsTyping: (isTyping: boolean) => void;
  fetchSessions: (collectionId: string) => Promise<void>;
  createSession: (collectionId: string, title?: string) => Promise<ChatSession>;
  deleteSession: (collectionId: string, sessionId: string) => Promise<void>;
  sendMessage: (collectionId: string, sessionId: string, message: string) => Promise<void>;
  fetchHistory: (collectionId: string, sessionId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,

  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    // Prevent duplicate messages with the same id
    if (message.id && state.messages.some((m) => m.id === message.id)) {
      return state;
    }
    // Add message and sort by created_at to ensure correct order
    const newMessages = [...state.messages, message].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return { messages: newMessages };
  }),
  setIsTyping: (isTyping) => set({ isTyping }),

  fetchSessions: async (collectionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getChatSessions(collectionId);
      set({ sessions: response.sessions as ChatSession[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  createSession: async (collectionId, title) => {
    set({ isLoading: true, error: null });
    try {
      const session = await api.createChatSession(collectionId, title) as ChatSession;
      set((state) => ({ sessions: [...state.sessions, session], currentSession: session }));
      return session;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSession: async (collectionId, sessionId) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteChatSession(collectionId, sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (collectionId, sessionId, message) => {
    // Add user message immediately for optimistic UI
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      sources: [],
      created_at: new Date().toISOString(),
    };
    get().addMessage(tempUserMessage);
    
    set({ isLoading: true, isTyping: true, error: null });
    try {
      const response = await api.sendMessage(collectionId, sessionId, message);
      // Remove temp user message and add the real ones
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempUserMessage.id)
      }));
      if (response.user_message) {
        get().addMessage(response.user_message as ChatMessage);
      }
      if (response.assistant_message) {
        get().addMessage(response.assistant_message as ChatMessage);
      }
    } catch (error) {
      // Remove temp message on error
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempUserMessage.id),
        error: (error as Error).message
      }));
      throw error;
    } finally {
      set({ isLoading: false, isTyping: false });
    }
  },

  fetchHistory: async (collectionId, sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getChatHistory(collectionId, sessionId) as { messages: ChatMessage[] };
      // Sort messages by created_at to ensure correct chronological order
      const sortedMessages = [...response.messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      set({ messages: sortedMessages });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
