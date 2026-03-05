"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen,
  MessageSquare,
  Globe,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Loader2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  FileText,
  Activity,
  Zap,
} from "lucide-react";
import { Button, Card, Badge, Progress, EmptyState, Skeleton } from "@/components/ui";
import { StatCard } from "@/components/ui";
import CreateCollectionModal from "@/components/dashboard/CreateCollectionModal";
import { useCollectionStore, useAuthStore } from "@/store";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: "new-collection",
    label: "New Collection",
    description: "Scrape a new website",
    icon: Plus,
    href: "#new",
    color: "from-primary-500/20 to-accent-cyan/20",
  },
  {
    id: "chat",
    label: "AI Chat",
    description: "Ask questions about docs",
    icon: MessageSquare,
    href: "/dashboard/chat",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "learning",
    label: "Learning Paths",
    description: "Generate study roadmaps",
    icon: GraduationCap,
    href: "/dashboard/learning-path",
    color: "from-amber-500/20 to-orange-500/20",
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { collections, isLoading, fetchCollections } = useCollectionStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const completedCollections = collections.filter((c) => c.status === "completed");
  const processingCollections = collections.filter((c) => c.status === "crawling" || c.status === "embedding");
  const totalPages = collections.reduce((sum, c) => sum + (c.pages_count || 0), 0);
  const recentCollections = [...collections]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" };
      case "crawling": case "embedding":
        return { icon: Loader2, color: "text-primary-400", bg: "bg-primary-500/10" };
      case "error":
        return { icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10" };
      default:
        return { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" };
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.id === "new-collection") {
      setShowCreateModal(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          New Collection
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            label="Total Collections"
            value={collections.length}
            icon={FolderOpen}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            label="Total Pages"
            value={totalPages}
            icon={FileText}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Completed"
            value={completedCollections.length}
            icon={CheckCircle2}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatCard
            label="Processing"
            value={processingCollections.length}
            icon={Activity}
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                {action.id === "new-collection" ? (
                  <button
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left"
                  >
                    <Card className="p-4 hover:bg-white/5 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", action.color)}>
                          <Icon className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                            {action.label}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </Card>
                  </button>
                ) : (
                  <Link href={action.href}>
                    <Card className="p-4 hover:bg-white/5 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", action.color)}>
                          <Icon className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                            {action.label}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </Card>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Collections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Collections</h2>
          {collections.length > 0 && (
            <Link href="/dashboard/collections">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : recentCollections.length > 0 ? (
          <Card>
            <div className="divide-y divide-dark-700/50">
              {recentCollections.map((collection, index) => {
                const statusConfig = getStatusConfig(collection.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/dashboard/collections/${collection.id}`}>
                      <div className="p-4 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", statusConfig.bg)}>
                            <StatusIcon className={cn("w-5 h-5", statusConfig.color, collection.status === "crawling" || collection.status === "embedding" && "animate-spin")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                                {collection.name}
                              </h3>
                              <Badge
                                variant={collection.status === "completed" ? "success" : collection.status === "error" ? "error" : "default"}
                                className="hidden sm:flex"
                              >
                                {collection.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {collection.url}
                            </p>
                          </div>
                          <div className="hidden sm:flex flex-col items-end gap-1">
                            <span className="text-xs font-medium text-white">
                              {collection.pages_count} pages
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(collection.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                        </div>
                        
                        {collection.status === "crawling" || collection.status === "embedding" && (collection as { progress?: number }).progress !== undefined && (
                          <div className="mt-3 ml-14">
                            <Progress value={(collection as { progress?: number }).progress || 0} className="h-1" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <EmptyState
              icon={FolderOpen}
              title="No Collections Yet"
              description="Create your first collection to start scraping documentation"
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Collection
                </Button>
              }
            />
          </Card>
        )}
      </div>

      {/* Processing Jobs */}
      {processingCollections.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-white">Currently Processing</h2>
          </div>
          <div className="grid gap-3">
            {processingCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-sm font-medium text-white truncate">
                          {collection.name}
                        </h3>
                        <span className="text-sm font-medium text-primary-400">
                          {(collection as { progress?: number }).progress || 0}%
                        </span>
                      </div>
                      <Progress value={(collection as { progress?: number }).progress || 0} className="mt-2 h-1.5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary-500/10 to-accent-cyan/10 border-primary-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-white">Pro Tip</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Generate a learning path from any completed collection to get a structured study roadmap with difficulty levels.
              </p>
              <Link href="/dashboard/learning-path" className="inline-block mt-3">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Try Learning Paths
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </motion.div>
  );
}
