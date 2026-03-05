"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
  Search,
  MessageSquare,
  Trash2,
  Sparkles,
  Map,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  MoreVertical,
  GraduationCap,
  Files,
  Globe,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Progress, EmptyState, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Page {
  id: string;
  url: string;
  title: string;
  content?: string;
  status: string;
  scraped_at?: string;
  error?: string;
}

interface CollectionDetail {
  id: string;
  name: string;
  description?: string;
  base_url: string;
  status: "pending" | "processing" | "completed" | "error";
  pages_count: number;
  created_at: string;
  updated_at: string;
  progress?: number;
  error?: string;
  pages?: Page[];
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      const data = await api.getCollection(collectionId);
      setCollection(data as CollectionDetail);
    } catch (error) {
      console.error("Failed to load collection:", error);
      toast.error("Failed to load collection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteCollection(collectionId);
      toast.success("Collection deleted successfully");
      router.push("/dashboard/collections");
    } catch (error) {
      console.error("Failed to delete collection:", error);
      toast.error("Failed to delete collection");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Completed" };
      case "processing":
        return { icon: Loader2, color: "text-primary-400", bg: "bg-primary-500/10", label: "Processing" };
      case "error":
        return { icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10", label: "Error" };
      default:
        return { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" };
    }
  };

  const filteredPages = collection?.pages?.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.url.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!collection) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={AlertCircle}
          title="Collection Not Found"
          description="The collection you're looking for doesn't exist or has been deleted."
          action={
            <Link href="/dashboard/collections">
              <Button variant="primary">Back to Collections</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const statusConfig = getStatusConfig(collection.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link href="/dashboard/collections" className="mt-1">
            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                {collection.name}
              </h1>
              <Badge variant={collection.status === "completed" ? "success" : collection.status === "error" ? "error" : "info"}>
                <StatusIcon className={cn("w-3 h-3 mr-1", collection.status === "processing" && "animate-spin")} />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-gray-400 text-sm mt-1 truncate">
              {collection.base_url}
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href={`/dashboard/chat?collection=${collection.id}`}>
            <Button variant="secondary" leftIcon={<MessageSquare className="w-4 h-4" />}>
              Chat
            </Button>
          </Link>
          <Link href={`/dashboard/learning-path?collection=${collection.id}`}>
            <Button variant="secondary" leftIcon={<GraduationCap className="w-4 h-4" />}>
              Learning Path
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            className="text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href={`/dashboard/chat?collection=${collection.id}`} className="flex-1">
            <Button variant="secondary" className="w-full" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </Link>
          <Link href={`/dashboard/learning-path?collection=${collection.id}`} className="flex-1">
            <Button variant="secondary" className="w-full" size="sm">
              <GraduationCap className="w-4 h-4 mr-2" />
              Learn
            </Button>
          </Link>
          <button
            onClick={() => setShowMobileActions(!showMobileActions)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Actions Dropdown */}
      <AnimatePresence>
        {showMobileActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden overflow-hidden"
          >
            <Card className="p-2">
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setShowMobileActions(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Collection</span>
              </button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
              <Files className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{collection.pages_count}</div>
              <div className="text-xs text-gray-400">Total Pages</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {collection.pages?.filter((p) => p.status === "completed").length || 0}
              </div>
              <div className="text-xs text-gray-400">Scraped</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">
                {(() => {
                  try {
                    return new URL(collection.base_url).hostname.split(".").slice(-2).join(".");
                  } catch {
                    return collection.base_url || "N/A";
                  }
                })()}
              </div>
              <div className="text-xs text-gray-400">Domain</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white truncate">
                {new Date(collection.created_at).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-400">Created</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress bar for processing */}
      {collection.status === "processing" && collection.progress !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Scraping progress</span>
              <span className="text-sm font-medium text-white">{collection.progress}%</span>
            </div>
            <Progress value={collection.progress} className="h-2" />
          </Card>
        </motion.div>
      )}

      {/* Error display */}
      {collection.status === "error" && collection.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 border-rose-500/20 bg-rose-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-rose-400">Error occurred</h4>
                <p className="text-sm text-gray-400 mt-1">{collection.error}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Pages Section */}
      <Card>
        <div className="p-4 border-b border-dark-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              Pages ({filteredPages.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-dark-700/50">
          {filteredPages.length > 0 ? (
            filteredPages.map((page, index) => {
              const pageStatus = getStatusConfig(page.status);
              const PageStatusIcon = pageStatus.icon;
              return (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedPage(selectedPage?.id === page.id ? null : page)}
                  className={cn(
                    "p-4 hover:bg-white/5 cursor-pointer transition-colors",
                    selectedPage?.id === page.id && "bg-white/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", pageStatus.bg)}>
                      <PageStatusIcon className={cn("w-4 h-4", pageStatus.color, page.status === "processing" && "animate-spin")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white truncate">
                          {page.title || "Untitled"}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {page.url}
                      </p>
                      
                      {/* Expanded content */}
                      <AnimatePresence>
                        {selectedPage?.id === page.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-dark-700/50"
                          >
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={page.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/50 rounded-lg text-xs text-gray-300 hover:bg-dark-600/50 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open URL
                              </a>
                              {page.scraped_at && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-700/50 rounded-lg text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(page.scraped_at)}
                                </span>
                              )}
                            </div>
                            {page.error && (
                              <p className="text-xs text-rose-400 mt-2">
                                Error: {page.error}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 text-gray-500 transition-transform flex-shrink-0",
                      selectedPage?.id === page.id && "rotate-90"
                    )} />
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8">
              <EmptyState
                icon={FileText}
                title={searchQuery ? "No pages found" : "No pages yet"}
                description={searchQuery ? "Try a different search term" : "Pages will appear here once scraping starts"}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-dark-800 rounded-2xl border border-dark-600/50 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Collection</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <strong className="text-white">{collection.name}</strong>? 
                All {collection.pages_count} pages and associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="flex-1 bg-rose-500 hover:bg-rose-600"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
