"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  icon: Icon,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const variants = {
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      title: "text-blue-400",
    },
    success: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      icon: "text-emerald-400",
      title: "text-emerald-400",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      icon: "text-amber-400",
      title: "text-amber-400",
    },
    error: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      icon: "text-rose-400",
      title: "text-rose-400",
    },
  };

  const styles = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative flex gap-3 p-4 rounded-xl border",
        styles.bg,
        styles.border,
        className
      )}
    >
      {Icon && (
        <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn("font-semibold mb-1", styles.title)}>{title}</h4>
        )}
        <div className="text-sm text-gray-300">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

interface AlertStackProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertStack: React.FC<AlertStackProps> = ({ children, className }) => {
  return (
    <AnimatePresence>
      <div className={cn("space-y-3", className)}>{children}</div>
    </AnimatePresence>
  );
};
