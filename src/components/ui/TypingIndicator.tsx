"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

interface TypingIndicatorProps {
  variant?: "dots" | "text" | "pulse";
}

export const TypingIndicator = memo(({ variant = "dots" }: TypingIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-4 max-w-5xl mx-auto"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center border border-dark-600/50 shadow-lg relative">
          <Bot className="w-4.5 h-4.5 text-primary-400" />
          {/* Pulsing indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
        </div>
      </div>

      {/* Typing bubble */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1.5 text-xs">
          <span className="font-medium text-gray-400">AI Assistant</span>
          <span className="text-gray-600">•</span>
          <span className="text-primary-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            thinking...
          </span>
        </div>

        <div className="bg-dark-800/90 border border-dark-700/50 rounded-2xl rounded-tl-md px-5 py-4 shadow-lg">
          {variant === "dots" && (
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-primary-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}

          {variant === "text" && (
            <div className="flex items-center gap-2 text-gray-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-primary-400" />
              </motion.div>
              <span className="text-sm">Generating response...</span>
            </div>
          )}

          {variant === "pulse" && (
            <div className="flex items-center gap-3">
              <motion.div
                className="w-32 h-3 rounded-full bg-dark-700"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="w-20 h-3 rounded-full bg-dark-700"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;
