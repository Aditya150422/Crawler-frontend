"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glow = false,
  gradient = false,
}) => {
  return (
    <div
      className={cn(
        "bg-dark-800/50 backdrop-blur-xl border border-dark-600/50 rounded-2xl",
        hover && "hover:border-primary-500/30 hover:bg-dark-800/70 transition-all duration-300",
        glow && "shadow-lg shadow-primary-500/10",
        gradient && "gradient-border",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn("px-6 py-4 border-b border-dark-600/50", className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn("p-6", className)}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn("px-6 py-4 border-t border-dark-600/50", className)}>
      {children}
    </div>
  );
};
