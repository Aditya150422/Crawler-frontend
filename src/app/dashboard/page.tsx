"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Loader2,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Progress } from "@/components/ui";
import { useCollectionStore, useAuthStore } from "@/store";
import { formatDate, extractDomain, getStatusColor } from "@/lib/utils";
import { socketManager } from "@/lib/socket";
import CreateCollectionModal from "@/components/dashboard/CreateCollectionModal";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { collections, fetchCollections, isLoading, updateCollectionStatus } = useCollectionStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeJobs, setActiveJobs] = useState<Record<string, { percentage: number; message: string }>>({});

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);
    
  // Separate effect for socket connection and job subscriptions
  useEffect(() => {
    const socket = socketManager.connect();

    const handleProgress = (data: { job_id: string; percentage: number; message: string; stage: string }) => {
      console.log("Dashboard - Progress update:", data);
      setActiveJobs((prev) => ({
        ...prev,
        [data.job_id]: { percentage: data.percentage, message: data.message },
      }));
    };

    const handleJobUpdate = (data: { job_id: string; status: string; pages_stored?: number }) => {
      console.log("Dashboard - Job update:", data);
      // Find collection with this job_id and update it
      const collection = collections.find((c) => c.job_id === data.job_id);
      if (collection) {
        updateCollectionStatus(collection.id, data.status, data.pages_stored);
      }
      if (data.status === "completed" || data.status === "error") {
        setActiveJobs((prev) => {
          const newJobs = { ...prev };
          delete newJobs[data.job_id];
          return newJobs;
        });
        fetchCollections();
      }
    };

    // Wait for socket to connect before joining rooms
    const handleConnect = () => {
      console.log("Dashboard - Socket connected, joining job rooms...");
      collections.forEach((c) => {
        if (c.job_id && (c.status === "crawling" || c.status === "embedding" || c.status === "pending")) {
          console.log("Dashboard - Joining job room:", c.job_id);
          socketManager.joinJob(c.job_id);
        }
      });
    };

    socketManager.on("progress", handleProgress);
    socketManager.on("job_update", handleJobUpdate);
    socketManager.on("connect", handleConnect);

    // If already connected, join rooms immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socketManager.off("progress", handleProgress);
      socketManager.off("job_update", handleJobUpdate);
      socketManager.off("connect", handleConnect);
    };
  }, [collections, updateCollectionStatus, fetchCollections]);

  const stats = [
    {
      label: "Total Collections",
      value: collections.length,
      icon: FolderOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Pages Indexed",
      value: collections.reduce((acc, c) => acc + c.pages_count, 0),
      icon: Globe,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Chat Sessions",
      value: collections.reduce((acc, c) => acc + (c.chat_sessions?.length || 0), 0),
      icon: MessageSquare,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Active Jobs",
      value: collections.filter((c) => c.status === "crawling" || c.status === "embedding").length,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];

  const recentCollections = [...collections]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "crawling":
      case "embedding":
        return <Badge variant="warning" pulse>Processing</Badge>;
      case "pending":
        return <Badge variant="info" pulse>Pending</Badge>;
      case "error":
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back{user?.username ? `, ${user.username}` : ""}
          </h1>
          <p className="text-gray-400 mt-1">
            Here&apos;s an overview of your AI knowledge bases
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          New Collection
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="overflow-hidden">
              <CardContent className="relative">
                <div
                  className={`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.color}`}
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Collections */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-dark-600/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Collections</h2>
              <Link href="/dashboard/collections">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            </div>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : recentCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4">
                    <FolderOpen className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No collections yet</h3>
                  <p className="text-gray-400 mb-4">
                    Create your first collection to start scraping websites
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Create Collection
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-dark-600/50">
                  {recentCollections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/dashboard/collections/${collection.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white truncate">
                            {collection.name}
                          </h3>
                          {getStatusBadge(collection.status)}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {extractDomain(collection.url)}
                        </p>
                        {collection.job_id && activeJobs[collection.job_id] && (
                          <div className="mt-2">
                            <Progress
                              value={activeJobs[collection.job_id].percentage}
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {activeJobs[collection.job_id].message}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white">{collection.pages_count} pages</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(collection.updated_at)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <div className="px-6 py-4 border-b border-dark-600/50">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <CardContent className="space-y-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Collection</span>
              </button>
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Start Chat</span>
              </Link>
              <Link
                href="/dashboard/collections"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
              >
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium">Manage Collections</span>
              </Link>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="gradient-border">
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-accent-purple" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Pro Tip</h3>
                  <p className="text-sm text-gray-400">
                    Use specific collection names to organize your knowledge bases by
                    topic or project for easier management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
