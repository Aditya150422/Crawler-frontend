import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (...args: any[]) => void;

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(API_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Re-attach all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Job subscription methods
  joinJob(jobId: string): void {
    this.emit("join_job", { job_id: jobId });
  }

  leaveJob(jobId: string): void {
    this.emit("leave_job", { job_id: jobId });
  }

  // Collection subscription methods
  joinCollection(collectionId: string): void {
    this.emit("join_collection", { collection_id: collectionId });
  }

  leaveCollection(collectionId: string): void {
    this.emit("leave_collection", { collection_id: collectionId });
  }

  // Chat methods
  joinChat(collectionId: string, sessionId?: string): void {
    this.emit("join_chat", { collection_id: collectionId, session_id: sessionId });
  }

  leaveChat(collectionId: string, sessionId?: string): void {
    this.emit("leave_chat", { collection_id: collectionId, session_id: sessionId });
  }

  sendChatMessage(
    collectionId: string,
    message: string,
    sessionId?: string,
    topK?: number
  ): void {
    this.emit("send_message", {
      collection_id: collectionId,
      session_id: sessionId,
      message,
      top_k: topK,
    });
  }

  ping(): void {
    this.emit("ping");
  }
}

export const socketManager = new SocketManager();
