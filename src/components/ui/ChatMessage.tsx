"use client";

import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
  onCopy?: (text: string) => void;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export const ChatMessage = memo(({
  message,
  index,
  onCopy,
  onRegenerate,
  isLast = false,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const isUser = message.role === "user";
  const hasSources = message.sources && message.sources.length > 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(prev => prev === type ? null : type);
    // You could send this feedback to your backend here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "flex gap-4 max-w-5xl mx-auto group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <User className="w-4.5 h-4.5 text-white" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center border border-dark-600/50 shadow-lg">
            <Bot className="w-4.5 h-4.5 text-primary-400" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-[85%] min-w-0",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Role label */}
        <div className={cn(
          "flex items-center gap-2 mb-1.5 text-xs",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className={cn(
            "font-medium",
            isUser ? "text-primary-400" : "text-gray-400"
          )}>
            {isUser ? "You" : "AI Assistant"}
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-500">
            {formatDate(message.created_at)}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "relative rounded-2xl transition-all duration-200",
            isUser
              ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-md shadow-lg shadow-primary-500/20"
              : "bg-dark-800/90 border border-dark-700/50 rounded-tl-md shadow-lg"
          )}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Content */}
          <div className={cn(
            "px-4 py-3",
            !isUser && "prose-invert"
          )}>
            {isUser ? (
              <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            ) : (
              <MarkdownRenderer 
                content={message.content} 
                className="text-sm sm:text-base"
              />
            )}
          </div>

          {/* Actions (for assistant messages) */}
          {!isUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showActions ? 1 : 0 }}
              className={cn(
                "absolute -right-2 top-2 flex flex-col items-center gap-1 bg-dark-800 border border-dark-700/50 rounded-lg p-1 shadow-xl",
                showActions ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
              <button
                onClick={handleCopy}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  copied 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                )}
                title="Copy response"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleFeedback("up")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  feedback === "up"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                )}
                title="Good response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleFeedback("down")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  feedback === "down"
                    ? "bg-red-500/20 text-red-400"
                    : "text-gray-400 hover:text-white hover:bg-dark-700"
                )}
                title="Bad response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>

              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Sources */}
        {hasSources && (
          <div className="mt-3 w-full relative z-20">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors mb-2"
            >
              {showSources ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <span>{message.sources?.length} source{message.sources && message.sources.length !== 1 ? "s" : ""}</span>
            </button>

            <motion.div
              initial={false}
              animate={{ 
                height: showSources ? "auto" : 0,
                opacity: showSources ? 1 : 0
              }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {message.sources?.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/source inline-flex items-center gap-2 px-3 py-2 bg-dark-800/80 border border-dark-700/50 rounded-lg hover:border-primary-500/30 hover:bg-dark-800 transition-all"
                  >
                    <div className="w-6 h-6 rounded-md bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-3 h-3 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-200 truncate max-w-[150px] group-hover/source:text-white transition-colors">
                        {source.title || "Source"}
                      </p>
                      {source.similarity && (
                        <p className="text-[10px] text-gray-500">
                          {Math.round(source.similarity * 100)}% match
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
