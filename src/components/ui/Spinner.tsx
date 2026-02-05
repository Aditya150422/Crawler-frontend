"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "rounded-full border-t-primary-500 border-r-transparent border-b-primary-500/30 border-l-transparent animate-spin",
        sizes[size],
        className
      )}
    />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-950/90 backdrop-blur-sm">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
      {message && (
        <p className="mt-4 text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );
};
