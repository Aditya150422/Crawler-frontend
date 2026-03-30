"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Map,
  RefreshCw,
  Download,
  ChevronRight,
  GraduationCap,
  Layers,
  Target,
  BookOpen,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Button, Card, Badge, EmptyState, Modal } from "@/components/ui";
import { LearningPathGraph, LearningPathPanel } from "@/components/learning-path";
import { api } from "@/lib/api";
import {
  LearningPathResponse,
  LearningNode,
  LearningNodeSummaryResponse,
} from "@/types";
import { useCollectionStore } from "@/store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function LearningPathContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionId = searchParams.get("collection");

  const { collections, fetchCollections } = useCollectionStore();
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);
  const [summaryNode, setSummaryNode] = useState<LearningNode | null>(null);
  const [summaryLoadingNodeId, setSummaryLoadingNodeId] = useState<string | null>(null);
  const [nodeSummaries, setNodeSummaries] = useState<
    Record<string, LearningNodeSummaryResponse>
  >({});
  const [showPanel, setShowPanel] = useState(true);
  const [collectionName, setCollectionName] = useState<string>("");
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (collectionId) {
      loadLearningPath();
      loadCollectionInfo();
    }
  }, [collectionId]);

  const loadCollectionInfo = async () => {
    if (!collectionId) return;
    try {
      const collection = await api.getCollection(collectionId);
      setCollectionName((collection as { name: string }).name || "");
    } catch (error) {
      console.error("Failed to load collection info:", error);
    }
  };

  const loadLearningPath = async () => {
    if (!collectionId) return;
    
    setIsLoading(true);
    try {
      const result = await api.getLearningPathForCollection(collectionId);
      setLearningPath(result);
      setNodeSummaries({});
    } catch (error) {
      console.error("Failed to load learning path:", error);
      setLearningPath(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePath = async () => {
    if (!collectionId) return;

    setIsLoading(true);
    try {
      const result = await api.generateLearningPathForCollection(collectionId);
      setLearningPath(result);
      setNodeSummaries({});
      toast.success("Learning path generated successfully!");
    } catch (error) {
      console.error("Failed to generate learning path:", error);
      toast.error((error as Error).message || "Failed to generate learning path");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNodeSummary = async (node: LearningNode) => {
    if (!collectionId || nodeSummaries[node.id]) return;

    setSummaryLoadingNodeId(node.id);
    try {
      const summary = await api.getLearningPathNodeSummary(collectionId, node.id);
      setNodeSummaries((prev) => ({ ...prev, [node.id]: summary }));
    } catch (error) {
      console.error("Failed to fetch node summary:", error);
      toast.error("Failed to load topic summary");
    } finally {
      setSummaryLoadingNodeId(null);
    }
  };

  const handleNodeClick = (node: LearningNode) => {
    setSelectedNode(node);
    setSummaryNode(node);
    fetchNodeSummary(node);
    if (!showPanel) setShowPanel(true);
  };

  const handleNodeSelect = (nodeId: string) => {
    const node = learningPath?.nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setSummaryNode(node);
      fetchNodeSummary(node);
    }
  };

  const handleExport = () => {
    if (!learningPath) return;
    
    const dataStr = JSON.stringify(learningPath, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `learning-path-${collectionName || collectionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Learning path exported!");
  };

  const handleSelectCollection = (id: string) => {
    router.push(`/dashboard/learning-path?collection=${id}`);
    setShowCollectionDropdown(false);
  };

  const completedCollections = collections.filter((c) => c.status === "completed");
  const summaryData = summaryNode ? nodeSummaries[summaryNode.id] : null;
  const isSummaryLoading =
    Boolean(summaryNode) &&
    (summaryLoadingNodeId === summaryNode?.id || (!summaryData && !summaryNode?.summary));
  const summaryTitle = summaryData?.node_label || summaryNode?.label || "Topic Summary";
  const summaryText =
    summaryData?.summary ||
    summaryNode?.summary ||
    summaryNode?.description ||
    "No summary available for this topic yet.";

  // No collection selected
  if (!collectionId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="p-8 sm:p-12">
          <EmptyState
            icon={Map}
            title="Select a Collection"
            description="Choose a collection to generate a personalized learning roadmap from its content"
            action={
              completedCollections.length > 0 ? (
                <div className="relative inline-block">
                  <Button
                    variant="primary"
                    onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                    rightIcon={<ChevronDown className="w-4 h-4" />}
                  >
                    Choose Collection
                  </Button>
                  
                  <AnimatePresence>
                    {showCollectionDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-dark-800 rounded-xl border border-dark-600/50 shadow-xl overflow-hidden z-20"
                      >
                        <div className="max-h-60 overflow-y-auto">
                          {completedCollections.map((collection) => (
                            <button
                              key={collection.id}
                              onClick={() => handleSelectCollection(collection.id)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                  {collection.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {collection.pages_count} pages
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/dashboard/collections">
                  <Button variant="primary">
                    Create a Collection First
                  </Button>
                </Link>
              )
            }
          />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={`/dashboard/collections/${collectionId}`}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Back
            </Button>
            <button className="sm:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Learning Roadmap</h1>
              {collectionName && (
                <Badge variant="info" className="hidden sm:flex">
                  {collectionName}
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
              AI-generated curriculum from documentation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegeneratePath}
            disabled={isLoading}
            leftIcon={<RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />}
          >
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={!learningPath}
            leftIcon={<Download className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant={showPanel ? "primary" : "ghost"}
            size="sm"
            onClick={() => setShowPanel(!showPanel)}
            leftIcon={<Layers className="w-4 h-4" />}
            className="hidden lg:flex"
          >
            Details
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <Card className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-cyan/10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Generating Learning Path
            </h3>
            <p className="text-gray-400 mb-4 text-sm sm:text-base max-w-sm mx-auto">
              AI is analyzing your documentation structure...
            </p>
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto" />
          </motion.div>
        </Card>
      ) : learningPath ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Graph */}
          <Card className="flex-1 overflow-hidden min-h-[300px] lg:min-h-0">
            <LearningPathGraph
              data={learningPath}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNode?.id}
            />
          </Card>

          {/* Mobile Panel Toggle */}
          <div className="lg:hidden">
            <Button
              variant="secondary"
              onClick={() => setShowPanel(!showPanel)}
              className="w-full"
              leftIcon={<Layers className="w-4 h-4" />}
            >
              {showPanel ? "Hide" : "Show"} Details Panel
            </Button>
          </div>

          {/* Panel */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "lg:w-80 xl:w-96 flex-shrink-0",
                  "max-h-[400px] lg:max-h-none overflow-auto"
                )}
              >
                <LearningPathPanel
                  data={learningPath}
                  selectedNode={selectedNode}
                  onClose={() => setShowPanel(false)}
                  onNodeSelect={handleNodeSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={GraduationCap}
            title="Generate Learning Path"
            description="Click the button below to analyze the documentation and create a structured learning roadmap"
            action={
              <Button
                variant="primary"
                onClick={handleRegeneratePath}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Roadmap
              </Button>
            }
          />
        </Card>
      )}

      {/* Stats Bar */}
      {learningPath && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
        >
          <div className="bg-dark-800/50 rounded-xl p-3 sm:p-4 border border-dark-700/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-white">
                  {learningPath.nodes.length}
                </div>
                <div className="text-xs text-gray-400">Topics</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 rounded-xl p-3 sm:p-4 border border-dark-700/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="text-base sm:text-lg">🌱</span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-emerald-400">
                  {learningPath.nodes.filter((n) => n.difficulty === "beginner").length}
                </div>
                <div className="text-xs text-gray-400">Beginner</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 rounded-xl p-3 sm:p-4 border border-dark-700/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="text-base sm:text-lg">🔥</span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-amber-400">
                  {learningPath.nodes.filter((n) => n.difficulty === "intermediate").length}
                </div>
                <div className="text-xs text-gray-400">Intermediate</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-800/50 rounded-xl p-3 sm:p-4 border border-dark-700/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <span className="text-base sm:text-lg">⚡</span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-rose-400">
                  {learningPath.nodes.filter((n) => n.difficulty === "advanced").length}
                </div>
                <div className="text-xs text-gray-400">Advanced</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <Modal
        isOpen={Boolean(summaryNode)}
        onClose={() => setSummaryNode(null)}
        title={summaryTitle}
        size="sm"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400">
            <span>{summaryData?.difficulty || summaryNode?.difficulty}</span>
            <span className="text-dark-500">•</span>
            <span>
              {(summaryData?.type || summaryNode?.type) === "core_topic"
                ? "Core Topic"
                : "Sub Topic"}
            </span>
            {(summaryData?.module || summaryNode?.module) && (
              <>
                <span className="text-dark-500">•</span>
                <span>{summaryData?.module || summaryNode?.module}</span>
              </>
            )}
          </div>
          {isSummaryLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
              Loading summary...
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-gray-200">{summaryText}</p>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}

export default function LearningPathPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      }
    >
      <LearningPathContent />
    </Suspense>
  );
}
