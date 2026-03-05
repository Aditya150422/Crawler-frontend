"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Plus,
  Search,
  Trash2,
  MessageSquare,
  MoreVertical,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  ChevronDown,
  ArrowUpDown,
  X,
  Map,
} from "lucide-react";
import { 
  Button, 
  Card, 
  CardContent, 
  Badge, 
  Input, 
  Progress, 
  Modal,
  EmptyState,
  Skeleton,
  SkeletonCard,
} from "@/components/ui";
import { useCollectionStore } from "@/store";
import { formatDate, extractDomain, cn } from "@/lib/utils";
import { socketManager } from "@/lib/socket";
import CreateCollectionModal from "@/components/dashboard/CreateCollectionModal";
import toast from "react-hot-toast";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "name" | "pages";
type FilterStatus = "all" | "completed" | "processing" | "error";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CollectionsPage() {
  const { collections, fetchCollections, deleteCollection, isLoading, updateCollectionStatus } =
    useCollectionStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Record<string, { percentage: number; message: string }>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    const socket = socketManager.connect();

    const handleProgress = (data: { job_id: string; percentage: number; message: string }) => {
      setActiveJobs((prev) => ({
        ...prev,
        [data.job_id]: { percentage: data.percentage, message: data.message },
      }));
    };

    const handleJobUpdate = (data: { job_id: string; status: string; pages_stored?: number }) => {
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

    const handleConnect = () => {
      collections.forEach((c) => {
        if (c.job_id && (c.status === "crawling" || c.status === "embedding" || c.status === "pending")) {
          socketManager.joinJob(c.job_id);
        }
      });
    };

    socketManager.on("progress", handleProgress);
    socketManager.on("job_update", handleJobUpdate);
    socketManager.on("connect", handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socketManager.off("progress", handleProgress);
      socketManager.off("job_update", handleJobUpdate);
      socketManager.off("connect", handleConnect);
    };
  }, [collections, updateCollectionStatus, fetchCollections]);

  // Filtered and sorted collections
  const filteredCollections = useMemo(() => {
    let result = [...collections];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((c) => {
        if (filterStatus === "completed") return c.status === "completed";
        if (filterStatus === "processing") return ["crawling", "embedding", "pending"].includes(c.status);
        if (filterStatus === "error") return c.status === "error";
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "pages":
          return b.pages_count - a.pages_count;
        default:
          return 0;
      }
    });

    return result;
  }, [collections, searchQuery, filterStatus, sortBy]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCollection(id);
      toast.success("Collection deleted successfully");
      setDeleteModalOpen(null);
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete collection");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "crawling":
        return <Badge variant="warning" pulse>Crawling</Badge>;
      case "embedding":
        return <Badge variant="warning" pulse>Embedding</Badge>;
      case "pending":
        return <Badge variant="info" pulse>Pending</Badge>;
      case "error":
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = useMemo(() => ({
    total: collections.length,
    completed: collections.filter((c) => c.status === "completed").length,
    processing: collections.filter((c) => ["crawling", "embedding", "pending"].includes(c.status)).length,
    totalPages: collections.reduce((acc, c) => acc + c.pages_count, 0),
  }), [collections]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            New Collection
          </Button>
        </div>

        {/* Stats Bar */}
        {!isLoading && collections.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/50">
              <div className="text-lg sm:text-xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-500">Total Collections</div>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/50">
              <div className="text-lg sm:text-xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/50">
              <div className="text-lg sm:text-xl font-bold text-amber-400">{stats.processing}</div>
              <div className="text-xs text-gray-500">Processing</div>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/50">
              <div className="text-lg sm:text-xl font-bold text-primary-400">{stats.totalPages}</div>
              <div className="text-xs text-gray-500">Total Pages</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            rightIcon={
              searchQuery ? (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>
        
        <div className="flex gap-2">
          {/* Filter Button */}
          <div className="relative">
            <Button
              variant={filterStatus !== "all" ? "primary" : "secondary"}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Filter</span>
              {filterStatus !== "all" && (
                <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                  1
                </span>
              )}
            </Button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-dark-800 rounded-xl border border-dark-600/50 shadow-xl overflow-hidden z-20"
                >
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-2 py-1">Status</p>
                    {(["all", "completed", "processing", "error"] as FilterStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilters(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          filterStatus === status
                            ? "bg-primary-500/20 text-primary-400"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Button */}
          <div className="relative">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                const options: SortOption[] = ["newest", "oldest", "name", "pages"];
                const currentIndex = options.indexOf(sortBy);
                setSortBy(options[(currentIndex + 1) % options.length]);
              }}
              leftIcon={<ArrowUpDown className="w-4 h-4" />}
            >
              <span className="hidden sm:inline capitalize">{sortBy}</span>
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-dark-800 rounded-xl border border-dark-600/50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "grid" ? "bg-primary-500/20 text-primary-400" : "text-gray-400 hover:text-white"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "list" ? "bg-primary-500/20 text-primary-400" : "text-gray-400 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Collections */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className={cn(
            viewMode === "grid" 
              ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "space-y-3"
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} lines={viewMode === "grid" ? 2 : 1} />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <EmptyState
            icon={searchQuery || filterStatus !== "all" ? Search : Globe}
            title={searchQuery || filterStatus !== "all" ? "No collections found" : "No collections yet"}
            description={
              searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first collection to start scraping and indexing websites"
            }
            action={
              !searchQuery && filterStatus === "all" ? (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Create Collection
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                >
                  Clear Filters
                </Button>
              )
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCollections.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card hover className="h-full flex flex-col group">
                    <CardContent className="flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Globe className="w-6 h-6 text-primary-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                              {collection.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {extractDomain(collection.url)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Menu */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenMenuId(openMenuId === collection.id ? null : collection.id);
                            }}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === collection.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-dark-800 rounded-xl border border-dark-600/50 shadow-xl overflow-hidden z-10"
                              >
                                <Link
                                  href={`/dashboard/collections/${collection.id}`}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  View Details
                                </Link>
                                {collection.status === "completed" && (
                                  <>
                                    <Link
                                      href={`/dashboard/chat?collection=${collection.id}`}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      Start Chat
                                    </Link>
                                    <Link
                                      href={`/dashboard/learning-path?collection=${collection.id}`}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                      <Map className="w-4 h-4" />
                                      Learning Path
                                    </Link>
                                  </>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteModalOpen(collection.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mb-4">{getStatusBadge(collection.status)}</div>

                      {/* Progress */}
                      {collection.job_id && activeJobs[collection.job_id] && (
                        <div className="mb-4">
                          <Progress
                            value={activeJobs[collection.job_id].percentage}
                            size="sm"
                          />
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {activeJobs[collection.job_id].message}
                          </p>
                        </div>
                      )}

                      {/* Error State */}
                      {collection.status === "error" && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Scraping failed</span>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{collection.pages_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{collection.chat_sessions?.length || 0}</span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                        <Clock className="w-3 h-3" />
                        {formatDate(collection.updated_at)}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto flex gap-2">
                        <Link href={`/dashboard/collections/${collection.id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        {collection.status === "completed" && (
                          <Link href={`/dashboard/chat?collection=${collection.id}`}>
                            <Button variant="primary" size="sm" leftIcon={<MessageSquare className="w-4 h-4" />}>
                              Chat
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredCollections.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link href={`/dashboard/collections/${collection.id}`}>
                    <Card hover className="group">
                      <CardContent className="py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                                {collection.name}
                              </h3>
                              {getStatusBadge(collection.status)}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {extractDomain(collection.url)}
                            </p>
                          </div>

                          {/* Progress for processing items */}
                          {collection.job_id && activeJobs[collection.job_id] && (
                            <div className="hidden sm:block w-32">
                              <Progress
                                value={activeJobs[collection.job_id].percentage}
                                size="sm"
                              />
                            </div>
                          )}

                          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{collection.pages_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span className="whitespace-nowrap">{formatDate(collection.updated_at)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {collection.status === "completed" && (
                              <Link 
                                href={`/dashboard/chat?collection=${collection.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="primary" size="sm" leftIcon={<MessageSquare className="w-4 h-4" />}>
                                  <span className="hidden sm:inline">Chat</span>
                                </Button>
                              </Link>
                            )}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setDeleteModalOpen(collection.id);
                              }}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalOpen}
        onClose={() => setDeleteModalOpen(null)}
        title="Delete Collection"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Are you sure?
          </h3>
          <p className="text-gray-400 mb-6 text-sm">
            This action cannot be undone. All scraped data and chat sessions will be permanently deleted.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteModalOpen && handleDelete(deleteModalOpen)}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
