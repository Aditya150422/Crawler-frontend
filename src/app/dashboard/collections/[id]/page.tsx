"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Globe,
  ArrowLeft,
  MessageSquare,
  FileText,
  Clock,
  ExternalLink,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Progress, Input, Modal } from "@/components/ui";
import { useCollectionStore } from "@/store";
import { api } from "@/lib/api";
import { socketManager } from "@/lib/socket";
import { formatDate, extractDomain } from "@/lib/utils";
import toast from "react-hot-toast";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentCollection, fetchCollection, deleteCollection, updateCollectionStatus } =
    useCollectionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    url: string;
    title: string;
    content: string;
    similarity: number;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [jobProgress, setJobProgress] = useState<{ percentage: number; message: string } | null>(
    null
  );

  useEffect(() => {
    const loadCollection = async () => {
      setIsLoading(true);
      await fetchCollection(resolvedParams.id);
      setIsLoading(false);
    };
    loadCollection();

    const socket = socketManager.connect();

    const handleProgress = (data: { job_id: string; percentage: number; message: string }) => {
      if (currentCollection?.job_id === data.job_id) {
        setJobProgress({ percentage: data.percentage, message: data.message });
      }
    };

    const handleJobUpdate = (data: { job_id: string; status: string; pages_stored?: number }) => {
      if (currentCollection?.job_id === data.job_id) {
        updateCollectionStatus(resolvedParams.id, data.status, data.pages_stored);
        if (data.status === "completed" || data.status === "error") {
          setJobProgress(null);
          fetchCollection(resolvedParams.id);
        }
      }
    };

    socketManager.on("progress", handleProgress);
    socketManager.on("job_update", handleJobUpdate);

    return () => {
      socketManager.off("progress", handleProgress);
      socketManager.off("job_update", handleJobUpdate);
    };
  }, [resolvedParams.id, fetchCollection, currentCollection?.job_id, updateCollectionStatus]);

  useEffect(() => {
    if (
      currentCollection?.job_id &&
      (currentCollection.status === "crawling" ||
        currentCollection.status === "embedding" ||
        currentCollection.status === "pending")
    ) {
      socketManager.joinJob(currentCollection.job_id);
    }
  }, [currentCollection?.job_id, currentCollection?.status]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !currentCollection) return;

    setIsSearching(true);
    try {
      const result = await api.searchContent({
        query: searchQuery,
        collection_name: currentCollection.name,
        top_k: 5,
      });
      setSearchResults(result.results);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCollection(resolvedParams.id);
      toast.success("Collection deleted");
      router.push("/dashboard/collections");
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" size="md">Completed</Badge>;
      case "crawling":
        return <Badge variant="warning" size="md" pulse>Crawling</Badge>;
      case "embedding":
        return <Badge variant="warning" size="md" pulse>Embedding</Badge>;
      case "pending":
        return <Badge variant="info" size="md" pulse>Pending</Badge>;
      case "error":
        return <Badge variant="error" size="md">Error</Badge>;
      default:
        return <Badge size="md">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!currentCollection) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-white mb-2">Collection not found</h2>
        <Link href="/dashboard/collections">
          <Button variant="primary">Back to Collections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/collections">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
      </div>

      {/* Collection Info */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                <Globe className="w-8 h-8 text-primary-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{currentCollection.name}</h1>
                  {getStatusBadge(currentCollection.status)}
                </div>
                <a
                  href={currentCollection.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {extractDomain(currentCollection.url)}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {jobProgress && (
              <div className="mt-6">
                <Progress value={jobProgress.percentage} showLabel size="md" />
                <p className="text-sm text-gray-400 mt-2">{jobProgress.message}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-dark-700/30 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {currentCollection.pages_count}
                </div>
                <div className="text-sm text-gray-400">Pages</div>
              </div>
              <div className="text-center p-4 bg-dark-700/30 rounded-xl">
                <div className="text-2xl font-bold text-white">
                  {currentCollection.chat_sessions?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Chat Sessions</div>
              </div>
              <div className="text-center p-4 bg-dark-700/30 rounded-xl">
                <div className="text-sm font-medium text-white">
                  {formatDate(currentCollection.created_at)}
                </div>
                <div className="text-sm text-gray-400">Created</div>
              </div>
              <div className="text-center p-4 bg-dark-700/30 rounded-xl">
                <div className="text-sm font-medium text-white">
                  {formatDate(currentCollection.updated_at)}
                </div>
                <div className="text-sm text-gray-400">Updated</div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {currentCollection.status === "completed" && (
                <Link href={`/dashboard/chat?collection=${currentCollection.id}`}>
                  <Button
                    variant="primary"
                    leftIcon={<MessageSquare className="w-5 h-5" />}
                  >
                    Start Chat
                  </Button>
                </Link>
              )}
              <Button
                variant="danger"
                leftIcon={<Trash2 className="w-5 h-5" />}
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      {currentCollection.status === "completed" && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-white mb-4">
              Search Collection
            </h2>
            <div className="flex gap-3">
              <Input
                placeholder="Search within this collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                isLoading={isSearching}
              >
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-400">
                  {searchResults.length} results found
                </h3>
                {searchResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-dark-700/30 rounded-xl border border-dark-600/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{result.title}</h4>
                      <Badge variant="info" size="sm">
                        {(result.similarity * 100).toFixed(0)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-2">
                      {result.content}
                    </p>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      {result.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Sessions */}
      {currentCollection.chat_sessions && currentCollection.chat_sessions.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-dark-600/50">
            <h2 className="text-lg font-semibold text-white">Chat Sessions</h2>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-dark-600/50">
              {currentCollection.chat_sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/chat?collection=${currentCollection.id}&session=${session.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {session.title || "Untitled Chat"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {session.messages?.length || 0} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(session.updated_at)}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Collection"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete &quot;{currentCollection.name}&quot;?
          </h3>
          <p className="text-gray-400 mb-6">
            This will permanently delete all scraped data and chat sessions.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
