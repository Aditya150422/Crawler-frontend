"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "minimal" | "centered";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default",
}) => {
  const variants = {
    default: "py-16 px-6",
    minimal: "py-8 px-4",
    centered: "py-20 px-6 min-h-[50vh] flex items-center",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "text-center",
        variants[variant],
        className
      )}
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="relative mx-auto mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center mx-auto">
            <Icon className="w-10 h-10 text-primary-400" />
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-accent-cyan/5 scale-150 -z-10" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/3 to-accent-cyan/3 scale-[2] -z-20" />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-white mb-2"
        >
          {title}
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-6 leading-relaxed"
        >
          {description}
        </motion.p>
        
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
