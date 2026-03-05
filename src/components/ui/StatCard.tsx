"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  gradient = "from-primary-500 to-accent-cyan",
  className,
  onClick,
}) => {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-rose-400",
    neutral: "text-gray-400",
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "relative overflow-hidden bg-dark-800/50 backdrop-blur-xl border border-dark-600/50 rounded-2xl p-6",
        "hover:border-primary-500/30 transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", gradient)} />
      
      {/* Content */}
      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
            gradient
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-white tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="relative mt-4 pt-4 border-t border-dark-600/50 flex items-center gap-2">
          {React.createElement(TrendIcon[trend.direction], {
            className: cn("w-4 h-4", trendColors[trend.direction]),
          })}
          <span className={cn("text-sm font-medium", trendColors[trend.direction])}>
            {trend.value > 0 ? "+" : ""}{trend.value}%
          </span>
          {trend.label && (
            <span className="text-xs text-gray-500">{trend.label}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid grid-cols-1 gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
};
