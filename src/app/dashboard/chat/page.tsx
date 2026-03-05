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
  X,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeft,
  Zap,
  BookOpen,
  ArrowUp,
  Lightbulb,
  Code,
  FileText,
} from "lucide-react";
import { Button, Badge, ChatMessage, TypingIndicator } from "@/components/ui";
import { useCollectionStore, useChatStore } from "@/store";
import { socketManager } from "@/lib/socket";
import { formatDate, cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType, ChatSession } from "@/types";

// Suggested prompts for quick start
const suggestedPrompts = [
  { icon: Lightbulb, text: "Explain the main concepts", color: "from-amber-500/20 to-orange-500/20" },
  { icon: Code, text: "Show me code examples", color: "from-violet-500/20 to-purple-500/20" },
  { icon: FileText, text: "Summarize the documentation", color: "from-emerald-500/20 to-teal-500/20" },
  { icon: BookOpen, text: "What are the best practices?", color: "from-blue-500/20 to-cyan-500/20" },
];

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

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

    const handleNewMessage = (data: { session_id: string; message: ChatMessageType }) => {
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

  // Close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const completedCollections = collections.filter((c) => c.status === "completed");
  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id);
    setCurrentSession(null);
    setMessages([]);
    setShowCollectionDropdown(false);
    router.push(`/dashboard/chat?collection=\${id}`);
  };

  const handleCreateSession = async () => {
    if (!selectedCollectionId) return;
    try {
      const session = await createSession(selectedCollectionId);
      router.push(`/dashboard/chat?collection=\${selectedCollectionId}&session=\${session.id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    if (selectedCollectionId) {
      fetchHistory(selectedCollectionId, session.id);
      router.push(`/dashboard/chat?collection=\${selectedCollectionId}&session=\${session.id}`);
    }
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedCollectionId) return;
    try {
      await deleteSession(selectedCollectionId, sessionId);
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        router.push(`/dashboard/chat?collection=\${selectedCollectionId}`);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = (text || inputValue).trim();
    if (!messageText || !selectedCollectionId || !currentSession) return;

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

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (!currentSession) {
      handleCreateSession().then(() => {
        setTimeout(() => handleSendMessage(prompt), 500);
      });
    } else {
      handleSendMessage(prompt);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex overflow-hidden rounded-2xl border border-dark-700/50 bg-dark-900/50">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
              "w-72 bg-dark-900 lg:bg-transparent border-r border-dark-700/50 lg:border-r-0",
              "flex flex-col"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-3 border-b border-dark-700/50 lg:border-b-0">
              <Button
                variant="primary"
                onClick={handleCreateSession}
                disabled={!selectedCollectionId}
                className="w-full justify-center"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New Chat
              </Button>
            </div>

            {/* Collection Selector */}
            <div className="px-3 py-2">
              <div className="relative">
                <button
                  onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-dark-800/80 hover:bg-dark-800 border border-dark-700/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-gray-500">Collection</p>
                    <p className="text-sm font-medium text-white truncate">
                      {selectedCollection?.name || "Select..."}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                    showCollectionDropdown && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {showCollectionDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-dark-800 rounded-xl border border-dark-600/50 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="max-h-64 overflow-y-auto">
                        {completedCollections.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-sm text-gray-400">No collections available</p>
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
                              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-primary-400" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-white truncate">{collection.name}</p>
                                <p className="text-xs text-gray-500">{collection.pages_count} pages</p>
                              </div>
                              {selectedCollectionId === collection.id && (
                                <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">
                History
              </p>
              {sessions.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-400">No conversations yet</p>
                  <p className="text-xs text-gray-500 mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      onMouseEnter={() => setHoveredSession(session.id)}
                      onMouseLeave={() => setHoveredSession(null)}
                      whileHover={{ x: 2 }}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group relative",
                        currentSession?.id === session.id
                          ? "bg-primary-500/10 border border-primary-500/20"
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                        currentSession?.id === session.id
                          ? "bg-primary-500/20"
                          : "bg-dark-800 group-hover:bg-dark-700"
                      )}>
                        <MessageSquare className={cn(
                          "w-4 h-4",
                          currentSession?.id === session.id ? "text-primary-400" : "text-gray-500"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          currentSession?.id === session.id ? "text-white" : "text-gray-300"
                        )}>
                          {session.title || "New conversation"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {formatDate(session.updated_at)}
                        </p>
                      </div>
                      
                      {/* Delete button */}
                      <AnimatePresence>
                        {(hoveredSession === session.id || currentSession?.id === session.id) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            role="button"
                            tabIndex={0}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Close button for mobile */}
            <div className="p-3 border-t border-dark-700/50 lg:hidden">
              <Button
                variant="ghost"
                onClick={() => setSidebarOpen(false)}
                className="w-full"
                leftIcon={<X className="w-4 h-4" />}
              >
                Close
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </button>
            
            {currentSession ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {currentSession.title || "AI Assistant"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedCollection?.name} • {messages.length} messages
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">AI Chat</h2>
                  <p className="text-xs text-gray-500">
                    {selectedCollection ? `Chat with \${selectedCollection.name}` : "Select a collection"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {currentSession && (
            <Badge variant="success" className="hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Online
            </Badge>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!selectedCollectionId ? (
            /* No Collection Selected */
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to AI Chat</h3>
                <p className="text-gray-400 mb-6">
                  Select a collection from the sidebar to start chatting with your documentation.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setSidebarOpen(true)}
                  leftIcon={<PanelLeft className="w-4 h-4" />}
                >
                  Open Sidebar
                </Button>
              </div>
            </div>
          ) : !currentSession ? (
            /* No Session - Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="text-center max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25"
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Chat with {selectedCollection?.name}
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Ask questions, get summaries, or explore the documentation using AI-powered chat.
                </p>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-8">
                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-primary-500/30 hover:bg-dark-800 transition-all text-left group"
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                          prompt.color
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {prompt.text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateSession}
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Start New Chat
                </Button>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="p-4 sm:p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Start the conversation</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    Ask anything about &quot;{selectedCollection?.name}&quot;
                  </p>
                  
                  {/* Quick prompts */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {suggestedPrompts.slice(0, 3).map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-sm text-gray-300 hover:text-white hover:border-primary-500/50 transition-all"
                      >
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    message={message}
                    index={index}
                    isLast={index === messages.length - 1}
                  />
                ))
              )}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator variant="dots" />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {selectedCollectionId && currentSession && (
          <div className="p-4 border-t border-dark-700/50 bg-dark-900/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isTyping ? "AI is thinking..." : "Ask anything about the documentation..."}
                    rows={1}
                    disabled={isTyping}
                    className={cn(
                      "w-full px-4 py-3 pr-12 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm",
                      "placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20",
                      "resize-none transition-all min-h-[48px] max-h-[200px]",
                      isTyping && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading || isTyping}
                  className={cn(
                    "p-3 rounded-xl transition-all flex-shrink-0",
                    inputValue.trim() && !isTyping
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
                      : "bg-dark-800 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-dark-800 rounded text-gray-400">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-dark-800 rounded text-gray-400">Shift + Enter</kbd> for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
