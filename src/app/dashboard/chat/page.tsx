"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  MessageSquare,
  Bot,
  User,
  ExternalLink,
  Trash2,
  Loader2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Spinner } from "@/components/ui";
import { useCollectionStore, useChatStore, useAuthStore } from "@/store";
import { socketManager } from "@/lib/socket";
import { formatDate, cn } from "@/lib/utils";
import type { ChatMessage, ChatSession } from "@/types";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionId = searchParams.get("collection");
  const sessionIdParam = searchParams.get("session");

  const { collections, fetchCollections } = useCollectionStore();
  const {
    sessions,
    currentSession,
    messages,
    isLoading,
    isTyping,
    fetchSessions,
    createSession,
    deleteSession,
    sendMessage,
    fetchHistory,
    setCurrentSession,
    setMessages,
    addMessage,
    setIsTyping,
  } = useChatStore();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(collectionId);
  const [inputValue, setInputValue] = useState("");
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Fetch sessions when collection is selected
  useEffect(() => {
    if (selectedCollectionId) {
      fetchSessions(selectedCollectionId);
    }
  }, [selectedCollectionId, fetchSessions]);

  // Load session history
  useEffect(() => {
    if (sessionIdParam && selectedCollectionId) {
      const session = sessions.find((s) => s.id === sessionIdParam);
      if (session) {
        setCurrentSession(session);
        fetchHistory(selectedCollectionId, sessionIdParam);
      }
    }
  }, [sessionIdParam, selectedCollectionId, sessions, setCurrentSession, fetchHistory]);

  // Socket.IO for real-time chat
  useEffect(() => {
    if (!selectedCollectionId || !currentSession) return;

    const socket = socketManager.connect();
    socketManager.joinChat(selectedCollectionId, currentSession.id);

    const handleNewMessage = (data: { session_id: string; message: ChatMessage }) => {
      if (data.session_id === currentSession.id) {
        addMessage(data.message);
      }
    };

    const handleTyping = () => setIsTyping(true);
    const handleTypingStopped = () => setIsTyping(false);

    socketManager.on("new_message", handleNewMessage);
    socketManager.on("typing", handleTyping);
    socketManager.on("typing_stopped", handleTypingStopped);

    return () => {
      socketManager.leaveChat(selectedCollectionId, currentSession.id);
      socketManager.off("new_message", handleNewMessage);
      socketManager.off("typing", handleTyping);
      socketManager.off("typing_stopped", handleTypingStopped);
    };
  }, [selectedCollectionId, currentSession, addMessage, setIsTyping]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const completedCollections = collections.filter((c) => c.status === "completed");
  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id);
    setCurrentSession(null);
    setMessages([]);
    setShowCollectionDropdown(false);
    router.push(`/dashboard/chat?collection=${id}`);
  };

  const handleCreateSession = async () => {
    if (!selectedCollectionId) return;
    try {
      const session = await createSession(selectedCollectionId);
      router.push(`/dashboard/chat?collection=${selectedCollectionId}&session=${session.id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    if (selectedCollectionId) {
      fetchHistory(selectedCollectionId, session.id);
      router.push(`/dashboard/chat?collection=${selectedCollectionId}&session=${session.id}`);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!selectedCollectionId) return;
    try {
      await deleteSession(selectedCollectionId, sessionId);
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        router.push(`/dashboard/chat?collection=${selectedCollectionId}`);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedCollectionId || !currentSession) return;

    const messageText = inputValue.trim();
    setInputValue("");

    try {
      await sendMessage(selectedCollectionId, currentSession.id, messageText);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4 shrink-0">
        {/* Collection Selector */}
        <Card>
          <CardContent className="p-3">
            <div className="relative">
              <button
                onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-white truncate">
                    {selectedCollection?.name || "Select Collection"}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    showCollectionDropdown && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {showCollectionDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-dark-800 rounded-xl border border-dark-600/50 shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto"
                  >
                    {completedCollections.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No completed collections available
                      </div>
                    ) : (
                      completedCollections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => handleSelectCollection(collection.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors",
                            selectedCollectionId === collection.id && "bg-primary-500/10"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {collection.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {collection.pages_count} pages
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        {selectedCollectionId && (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-600/50 flex items-center justify-between">
              <h3 className="font-medium text-white">Chat Sessions</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateSession}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400 mb-3">No chat sessions yet</p>
                  <Button variant="primary" size="sm" onClick={handleCreateSession}>
                    Start Chat
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-dark-600/50">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "group flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors",
                        currentSession?.id === session.id && "bg-primary-500/10"
                      )}
                      onClick={() => handleSelectSession(session)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {session.title || "New Chat"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.messages?.length || 0} messages
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedCollectionId ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Select a Collection</h2>
              <p className="text-gray-400 max-w-md">
                Choose a collection from the dropdown to start chatting with your scraped data
              </p>
            </div>
          </Card>
        ) : !currentSession ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-primary-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Start a Conversation</h2>
              <p className="text-gray-400 max-w-md mb-6">
                Create a new chat session or select an existing one to start asking questions
              </p>
              <Button variant="primary" onClick={handleCreateSession} leftIcon={<Plus className="w-5 h-5" />}>
                New Chat Session
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-dark-600/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    {currentSession.title || "AI Assistant"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Powered by {selectedCollection?.name}
                  </p>
                </div>
              </div>
              <Badge variant="success" pulse>Online</Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    How can I help you?
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Ask any question about the content in &quot;{selectedCollection?.name}&quot;
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        message.role === "user"
                          ? "bg-primary-500"
                          : "bg-dark-700"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-primary-400" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 max-w-[80%]",
                        message.role === "user" && "flex flex-col items-end"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-primary-500 text-white"
                            : "bg-dark-700/50 text-gray-200"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500">Sources:</p>
                          {message.sources.map((source, i) => (
                            <a
                              key={i}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {source.title || source.url}
                            </a>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-gray-500 mt-1">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="bg-dark-700/50 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - always fixed at bottom */}
            <div className="p-4 border-t border-dark-600/50">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isTyping ? "Generating response..." : "Ask a question..."}
                    rows={1}
                    disabled={isTyping}
                    className={cn(
                      "w-full px-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 resize-none transition-opacity",
                      isTyping && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || isTyping}
                  className="px-4"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
