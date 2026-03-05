"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
}) => {
  const baseStyles = "animate-pulse bg-gradient-to-r from-dark-700/50 via-dark-600/50 to-dark-700/50 bg-[length:200%_100%] animate-shimmer";

  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "rounded-2xl",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseStyles, variants.text)}
            style={{
              width: i === lines - 1 ? "70%" : "100%",
              height: height || undefined,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    />
  );
};

interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  showAvatar = true,
  showActions = true,
  lines = 3,
}) => {
  return (
    <div
      className={cn(
        "bg-dark-800/50 backdrop-blur-xl border border-dark-600/50 rounded-2xl p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showAvatar && (
          <Skeleton variant="circular" width={48} height={48} />
        )}
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" lines={lines} />
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2 mt-4">
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="rectangular" width={80} height={36} />
        </div>
      )}
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn("bg-dark-800/50 backdrop-blur-xl border border-dark-600/50 rounded-2xl overflow-hidden", className)}>
      {/* Header */}
      <div className="grid gap-4 p-4 bg-dark-700/30 border-b border-dark-600/50" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height={16} />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-dark-600/30">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" height={14} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonStats: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-dark-800/50 backdrop-blur-xl border border-dark-600/50 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="space-y-2">
              <Skeleton variant="text" width={60} height={28} />
              <Skeleton variant="text" width={80} height={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
