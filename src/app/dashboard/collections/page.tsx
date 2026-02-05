"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button, Card, CardContent, Badge, Input, Progress, Modal } from "@/components/ui";
import { useCollectionStore } from "@/store";
import { formatDate, extractDomain } from "@/lib/utils";
import { socketManager } from "@/lib/socket";
import CreateCollectionModal from "@/components/dashboard/CreateCollectionModal";
import toast from "react-hot-toast";

export default function CollectionsPage() {
  const { collections, fetchCollections, deleteCollection, isLoading, updateCollectionStatus } =
    useCollectionStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Record<string, { percentage: number; message: string }>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Separate effect for socket connection and job subscriptions
  useEffect(() => {
    const socket = socketManager.connect();

    const handleProgress = (data: { job_id: string; percentage: number; message: string }) => {
      console.log("Progress update:", data);
      setActiveJobs((prev) => ({
        ...prev,
        [data.job_id]: { percentage: data.percentage, message: data.message },
      }));
    };

    const handleJobUpdate = (data: { job_id: string; status: string; pages_stored?: number }) => {
      console.log("Job update:", data);
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
      console.log("Socket connected, joining job rooms...");
      collections.forEach((c) => {
        if (c.job_id && (c.status === "crawling" || c.status === "embedding" || c.status === "pending")) {
          console.log("Joining job room:", c.job_id);
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

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Collections</h1>
          <p className="text-gray-400 mt-1">
            Manage your scraped website collections
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

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : filteredCollections.length === 0 ? (
        <Card className="py-16">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No collections found" : "No collections yet"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first collection to start scraping and indexing websites"}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-5 h-5" />}
              >
                Create Collection
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="h-full flex flex-col">
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{collection.name}</h3>
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">
                            {extractDomain(collection.url)}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenMenuId(openMenuId === collection.id ? null : collection.id);
                          }}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
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

                    <div className="mb-4">{getStatusBadge(collection.status)}</div>

                    {collection.job_id && activeJobs[collection.job_id] && (
                      <div className="mb-4">
                        <Progress
                          value={activeJobs[collection.job_id].percentage}
                          size="sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {activeJobs[collection.job_id].message}
                        </p>
                      </div>
                    )}

                    {collection.status === "error" && (
                      <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Scraping failed
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {collection.pages_count} pages
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {collection.chat_sessions?.length || 0} chats
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <Clock className="w-3 h-3" />
                      Updated {formatDate(collection.updated_at)}
                    </div>

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
      )}

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
            Are you sure you want to delete this collection?
          </h3>
          <p className="text-gray-400 mb-6">
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
    </div>
  );
}
